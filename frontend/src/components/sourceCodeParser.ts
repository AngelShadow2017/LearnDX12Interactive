/**
 * A small, source-format-tolerant recognizer for C++/HLSL excerpts.
 *
 * The EPUB text extractor puts each printed code row in its own paragraph, so
 * this is deliberately not a full compiler. It lexes C++-like tokens, accepts
 * a few language productions (declarations, calls, expressions and control
 * syntax), then joins adjacent rows while delimiters are still open. Type and
 * API names are not enumerated: new SDK types work through the same grammar.
 */

type TokenKind = 'identifier' | 'number' | 'string' | 'symbol' | 'comment';
type Token = { kind: TokenKind; value: string };

export type ParsedCodeBlock = { text: string; nextIndex: number };

const declarationModifiers = new Set([
  'const', 'constexpr', 'extern', 'friend', 'inline', 'mutable', 'register',
  'static', 'volatile', 'virtual', 'explicit', 'uniform', 'in', 'out',
  'inout', 'row_major', 'column_major', 'globallycoherent', 'groupshared',
]);

const statementKeywords = new Set([
  'break', 'case', 'catch', 'continue', 'default', 'do', 'else', 'for',
  'if', 'return', 'switch', 'throw', 'try', 'while', 'discard',
]);

const declarationKeywords = new Set([
  'auto', 'bool', 'char', 'class', 'double', 'enum', 'float', 'int',
  'long', 'namespace', 'short', 'signed', 'struct', 'template', 'typedef',
  'typename', 'union', 'unsigned', 'using', 'void', 'wchar_t', 'public',
  'private', 'protected',
]);

const continuationOperators = new Set([
  '=', '+', '-', '*', '/', '%', '&', '|', '^', '!', '~', '<', '>',
  '<<', '>>', '&&', '||', '==', '!=', '<=', '>=', '+=', '-=', '*=',
  '/=', '%=', '&=', '|=', '^=', '->', '::', '.', ',', '?', ':',
]);

const multiCharacterSymbols = [
  '<<=', '>>=', '...', '->*', '.*', '::', '->', '++', '--', '+=', '-=',
  '*=', '/=', '%=', '&=', '|=', '^=', '&&', '||', '==', '!=', '<=', '>=',
  '<<', '>>', '##',
];

type DelimiterState = { paren: number; bracket: number; brace: number; continues: boolean };

/** Parse the consecutive extracted paragraphs beginning at `startIndex`. */
export function parseCodeBlock(paragraphs: string[], startIndex: number): ParsedCodeBlock | undefined {
  const first = splitLines(paragraphs[startIndex] ?? '');
  if (!first.length || !isSourceCodeParagraph(first[0])) return undefined;

  const codeLines = [...first];
  const state: DelimiterState = { paren: 0, bracket: 0, brace: 0, continues: false };
  for (const line of first) updateDelimiterState(line, state);

  let nextIndex = startIndex + 1;
  while (nextIndex < paragraphs.length) {
    const candidate = splitLines(paragraphs[nextIndex]);
    if (!candidate.length) break;

    let acceptsCandidate = true;
    const candidateState = { ...state };
    for (const line of candidate) {
      if (!isSourceCodeParagraph(line) && !isContinuation(line, candidateState)) {
        acceptsCandidate = false;
        break;
      }
      updateDelimiterState(line, candidateState);
    }
    if (!acceptsCandidate) break;

    codeLines.push(...candidate);
    Object.assign(state, candidateState);
    nextIndex += 1;
  }

  return { text: codeLines.join('\n'), nextIndex };
}

/** True when one paragraph has the shape of a C++/HLSL code row. */
export function isSourceCodeParagraph(value: string): boolean {
  const lines = splitLines(value);
  if (!lines.length) return false;
  if (lines.length === 1) return isSourceCodeLine(lines[0]);

  const state: DelimiterState = { paren: 0, bracket: 0, brace: 0, continues: false };
  for (const line of lines) {
    if (!isSourceCodeLine(line) && !isContinuation(line, state)) return false;
    updateDelimiterState(line, state);
  }
  return true;
}

function splitLines(value: string): string[] {
  return value.split('\n').map((line) => line.trim()).filter(Boolean);
}

function isSourceCodeLine(value: string): boolean {
  const tokens = tokenize(value);
  if (!tokens.length) return false;

  const first = tokens[0];
  if (first.kind === 'comment' || first.value === '#') return true;
  if (['{', '}'].includes(first.value)) return true;
  if (tokens.every(({ value: token }) => ['{', '}', ';', '};', '(', ')', '[', ']', '...'].includes(token))) return true;
  if (looksLikeNaturalLanguage(value, tokens)) return false;
  if (statementKeywords.has(first.value)) return true;
  if (declarationKeywords.has(first.value) || declarationModifiers.has(first.value)) return true;

  if (first.value === '[') {
    const close = matchingDelimiter(tokens, 0, '[', ']');
    const attribute = tokens.slice(1, close);
    if (close > 1 && attribute[0]?.kind === 'identifier'
        && (hasFunctionSyntax(attribute) || (attribute.length === 1 && attribute[0].kind === 'identifier'))) return true;
  }

  if (hasFunctionSyntax(tokens)) return true;
  if (hasDeclarationSyntax(tokens)) return true;
  if (hasExpressionSyntax(tokens)) return true;

  return false;
}

function tokenize(source: string): Token[] {
  const tokens: Token[] = [];
  let index = 0;

  while (index < source.length) {
    const char = source[index];
    if (/\s/.test(char)) { index += 1; continue; }

    if (source.startsWith('//', index)) {
      tokens.push({ kind: 'comment', value: source.slice(index) });
      break;
    }
    if (source.startsWith('/*', index)) {
      tokens.push({ kind: 'comment', value: source.slice(index) });
      break;
    }

    if (char === '"' || char === "'") {
      const quote = char;
      let end = index + 1;
      while (end < source.length) {
        if (source[end] === '\\') { end += 2; continue; }
        if (source[end] === quote) { end += 1; break; }
        end += 1;
      }
      tokens.push({ kind: 'string', value: source.slice(index, end) });
      index = end;
      continue;
    }

    const identifier = source.slice(index).match(/^[A-Za-z_$][\w$]*/);
    if (identifier) {
      tokens.push({ kind: 'identifier', value: identifier[0] });
      index += identifier[0].length;
      continue;
    }

    const number = source.slice(index).match(/^(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?[fFlLuU]*/);
    if (number) {
      tokens.push({ kind: 'number', value: number[0] });
      index += number[0].length;
      continue;
    }

    const symbol = multiCharacterSymbols.find((candidate) => source.startsWith(candidate, index));
    if (symbol) {
      tokens.push({ kind: 'symbol', value: symbol });
      index += symbol.length;
      continue;
    }

    tokens.push({ kind: 'symbol', value: char });
    index += 1;
  }

  return tokens;
}

function hasFunctionSyntax(tokens: Token[]): boolean {
  const open = tokens.findIndex(({ value }) => value === '(');
  if (open <= 0) return false;

  const prefix = tokens.slice(0, open);
  const suffix = tokens.slice(open);
  if (prefix.length > 6) return false;
  if (!prefix.every(({ kind, value }) => kind === 'identifier' || ['::', '->', '.', '*', '&', '&&', '<', '>', '>>', 'operator', '+', '-', '/', '%', '=', '^', '|', '~', '!', '<<'].includes(value))) return false;

  const isCall = prefix.length === 1 || prefix.some(({ value }) => value === '::' || value === '->' || value === '.');
  const hasOperatorName = prefix.some(({ value }) => value === 'operator');
  const isTypedFunction = prefix.length >= 2 && (hasDeclarationTypePrefix(prefix) || hasOperatorName);
  if (!isCall && !isTypedFunction) return false;

  const close = matchingDelimiter(suffix, 0, '(', ')');
  if (close < 0) return suffix.length > 1 && suffix.at(-1)?.value !== '.';

  const tail = suffix.slice(close + 1).map(({ value }) => value);
  if (tail.length === 0) return true;
  return [';', '{', '}', ':', 'const', 'noexcept', 'override', 'final', '->', '=', ',', ...declarationKeywords].includes(tail[0]);
}

function hasDeclarationTypePrefix(prefix: Token[]): boolean {
  if (prefix.length < 2 || prefix.length > 6) return false;
  const knownTypeWord = declarationKeywords.has(prefix[0].value)
    || declarationModifiers.has(prefix[0].value)
    || prefix[0].kind === 'identifier';
  return knownTypeWord && prefix.every(({ kind, value }) => kind === 'identifier' || ['::', '*', '&', '&&', '<', '>', '>>', 'operator', '+', '-', '/', '%', '^', '|', '~', '!'].includes(value));
}

function hasDeclarationSyntax(tokens: Token[]): boolean {
  const typeEnd = readType(tokens, 0);
  if (typeEnd === undefined || typeEnd >= tokens.length) return false;

  let index = typeEnd;
  // A C++ calling-convention macro may sit between a return type and a name;
  // permit this general type/name/decorator shape without knowing the macro.
  if (tokens[index]?.value === 'operator') return hasFunctionSyntax(tokens);
  if (tokens[index]?.kind !== 'identifier') return false;
  index += 1;

  if (tokens[index]?.value === '(') return hasFunctionSyntax(tokens);
  if (tokens[index]?.value === '[') {
    const close = matchingDelimiter(tokens, index, '[', ']');
    if (close < 0) return false;
    index = close + 1;
  }

  if (tokens[index]?.value === ':') {
    index += 1;
    if (tokens[index]?.kind !== 'identifier') return false;
    index += 1;
    if (tokens[index]?.value === '(') {
      const close = matchingDelimiter(tokens, index, '(', ')');
      if (close < 0) return true;
      index = close + 1;
    }
  }

  const remainder = tokens.slice(index);
  if (!remainder.length) return false;
  const first = remainder[0].value;
  return first === ';' || first === ',' || first === '=' || first === '{' || first === ':';
}

function readType(tokens: Token[], start: number): number | undefined {
  let index = start;
  while (declarationModifiers.has(tokens[index]?.value ?? '')) index += 1;

  if (tokens[index]?.kind !== 'identifier') return undefined;
  let base = tokens[index].value;
  index += 1;

  // Multiword built-in types such as `unsigned long long`.
  while (['unsigned', 'signed', 'short', 'long'].includes(base)
      && tokens[index]?.kind === 'identifier'
      && ['int', 'long', 'short', 'char', 'double'].includes(tokens[index].value)) {
    base = tokens[index].value;
    index += 1;
  }

  while (tokens[index]?.value === '::' && tokens[index + 1]?.kind === 'identifier') index += 2;
  if (tokens[index]?.value === '<') {
    const close = matchingTemplateClose(tokens, index);
    if (close < 0) return undefined;
    index = close + 1;
  }
  while (tokens[index]?.value === '::' && tokens[index + 1]?.kind === 'identifier') index += 2;

  while (['*', '&', '&&'].includes(tokens[index]?.value ?? '') || ['const', 'volatile'].includes(tokens[index]?.value ?? '')) index += 1;
  return index;
}

function matchingTemplateClose(tokens: Token[], start: number): number {
  let depth = 0;
  for (let index = start; index < tokens.length; index += 1) {
    if (tokens[index].value === '<') depth += 1;
    else if (tokens[index].value === '>') {
      depth -= 1;
      if (depth === 0) return index;
    } else if (tokens[index].value === '>>') {
      depth -= 2;
      if (depth <= 0) return index;
    }
  }
  return -1;
}

function hasExpressionSyntax(tokens: Token[]): boolean {
  const hasStatementEnd = tokens.some(({ value }) => value === ';');
  const hasOperator = tokens.some(({ value }) => ['=', '->', '::', '++', '--', '+=', '-=', '*=', '/=', '%=', '&&', '||', '==', '!=', '<=', '>=', '<<', '>>'].includes(value));
  const terminator = tokens.findIndex(({ value }) => value === ';');
  if (hasStatementEnd && terminator >= 0 && terminator === tokens.length - 1
      && (hasOperator || tokens.some(({ value }) => ['(', '[', '{', '}'].includes(value)))) return true;

  const first = tokens[0];
  if (first?.kind !== 'identifier') return false;
  const next = tokens[1]?.value;
  if (!['.', '->', '::', '['].includes(next ?? '')) return false;
  return hasOperator || hasStatementEnd || tokens.some(({ value }) => value === '(');
}

function isContinuation(line: string, state: DelimiterState): boolean {
  if (!state.paren && !state.bracket && !state.brace && !state.continues) return false;
  const tokens = tokenize(line);
  if (!tokens.length) return false;
  if (tokens[0].kind === 'comment') return true;
  if (looksLikeNaturalLanguage(line, tokens)) return false;
  if (isSourceCodeLine(line)) return true;

  // In an open call/declaration, argument and parameter rows often contain
  // only identifiers and commas. Accept that grammar fragment, not arbitrary
  // prose, while a delimiter is open.
  if (state.paren > 0 || state.bracket > 0 || state.continues) {
    const allowed = tokens.every(({ kind, value }) =>
      kind === 'identifier' || kind === 'number' || kind === 'string'
      || [',', '(', ')', '[', ']', ':', '.', '->', '::', '*', '&', '&&',
        '+', '-', '/', '%', '<', '>', '>>', '=', '?', ';', '...'].includes(value));
    return allowed && tokens.some(({ kind }) => kind === 'identifier' || kind === 'number');
  }

  // A bare enumerator or initializer is meaningful as code only inside a
  // braced declaration, where the previous row established that context.
  return state.brace > 0
    && tokens.length <= 3
    && tokens[0].kind === 'identifier'
    && (tokens.length === 1 || [',', ';', '='].includes(tokens[1]?.value ?? ''));
}

/**
 * Reject prose before trying the deliberately permissive code productions.
 * Extracted book paragraphs can contain brackets, semicolons and equations
 * such as `u = v`; those tokens alone are not evidence of source code.
 */
function looksLikeNaturalLanguage(source: string, tokens: Token[]): boolean {
  const withoutComment = source.replace(/\/\/.*$/, '').trim();
  const words = withoutComment.match(/[A-Za-z]+(?:'[A-Za-z]+)?/g) ?? [];
  if (words.length < 4) return false;

  // C++ and HLSL punctuation interrupts runs of words. Six ordinary words
  // separated only by spaces are a strong prose signal, even when the same
  // paragraph later contains an equation or a citation in square brackets.
  const proseRun = /\b[A-Za-z]{2,}\b(?:\s+\b[A-Za-z]{2,}\b){5}/.test(withoutComment);
  if (proseRun) return true;

  // A full sentence ending in prose punctuation cannot be a complete C++ or
  // HLSL statement. Decimal points are already part of number tokens.
  const endsAsSentence = /[.!?](?:[)'\"]*)$/.test(withoutComment);
  if (endsAsSentence && words.length >= 6) return true;

  // Tokenized prose often exposes commas and parentheses, but has very little
  // actual program punctuation relative to its word count.
  const syntaxTokens = tokens.filter(({ value }) =>
    [';', '{', '}', '=', '->', '::', '++', '--', '+=', '-=', '*=', '/=', '%='].includes(value));
  return words.length >= 14 && syntaxTokens.length === 0;
}

function updateDelimiterState(line: string, state: DelimiterState): void {
  const tokens = tokenize(line);
  for (const token of tokens) {
    if (token.kind === 'comment' || token.kind === 'string') break;
    if (token.value === '(') state.paren += 1;
    else if (token.value === ')') state.paren = Math.max(0, state.paren - 1);
    else if (token.value === '[') state.bracket += 1;
    else if (token.value === ']') state.bracket = Math.max(0, state.bracket - 1);
    else if (token.value === '{') state.brace += 1;
    else if (token.value === '}') state.brace = Math.max(0, state.brace - 1);
  }
  const last = tokens.at(-1)?.value;
  state.continues = continuationOperators.has(last ?? '') || state.paren > 0 || state.bracket > 0;
}

function matchingDelimiter(tokens: Token[], start: number, open: string, close: string): number {
  let depth = 0;
  for (let index = start; index < tokens.length; index += 1) {
    if (tokens[index].value === open) depth += 1;
    else if (tokens[index].value === close) {
      depth -= 1;
      if (depth === 0) return index;
    }
  }
  return -1;
}
