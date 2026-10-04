import { describe, expect, it } from 'vitest';
import chapterFiveSource from '../content/source/ch05.txt?raw';
import chapterOneSource from '../content/source/ch01.txt?raw';
import chapterTwoSource from '../content/source/ch02.txt?raw';
import chapterTwelveSource from '../content/source/ch12.txt?raw';
import chapterThirteenSource from '../content/source/ch13.txt?raw';
import { parseSource } from './OriginalBookText';

const allBookSources = import.meta.glob('../content/source/*.txt', {
  eager: true,
  query: '?raw',
  import: 'default',
}) as Record<string, string>;

describe('parseSource', () => {
  it('turns chapter objectives, examples, lists, captions, and code into semantic blocks', () => {
    const blocks = parseSource(`
Book title

Chapter 1

VECTOR ALGEBRA

Chapter introduction must remain visible.

Objectives:

- Learn vectors.

- Use coordinates.

# 1.1 VECTORS

[[IMG hand.jpg]]

Example 1.1

- First item.

- Second item.

[[IMG Fig1-1.jpg]]

Figure 1.1. A vector picture.

[[IMG note.jpg]]

#include <vector>

std::vector<int> values;
`, 'ch01');

    expect(blocks.find((block) => block.kind === 'objectives')).toMatchObject({ items: ['Learn vectors.', 'Use coordinates.'] });
    expect(blocks.some((block) => block.kind === 'paragraph' && block.text === 'Chapter introduction must remain visible.')).toBe(true);
    expect(blocks.find((block) => block.kind === 'heading')?.id).toBe('s11');
    expect(blocks.find((block) => block.kind === 'example')).toMatchObject({ text: '1.1' });
    expect(blocks.filter((block) => block.kind === 'marker')).toHaveLength(1);
    expect(blocks.find((block) => block.kind === 'list')).toMatchObject({ ordered: false, items: ['First item.', 'Second item.'] });
    expect(blocks.find((block) => block.kind === 'image')).toMatchObject({ figureNumber: 'Figure 1.1', caption: 'A vector picture.' });
    expect(blocks.find((block) => block.kind === 'code')).toMatchObject({ text: '#include <vector>\nstd::vector<int> values;' });
  });

  it('keeps extracted Direct3D code lines separate from prose and list text', () => {
    const source = `
Chapter 4

DIRECT3D INITIALIZATION

Direct3D is a low-level graphics API. We can call ID3D12CommandList::ClearRenderTargetView to clear the target.

- Get: Returns a pointer to the underlying COM interface. For example:
ComPtr<ID3D12RootSignature> mRootSignature;

...

// SetGraphicsRootSignature expects ID3D12RootSignature* argument.

mCommandList->SetGraphicsRootSignature(mRootSignature.Get());

- GetAddressOf: Returns the address of the pointer. For example:
ThrowIfFailed(md3dDevice->CreateCommandAllocator(

D3D12_COMMAND_LIST_TYPE_DIRECT,

mDirectCmdListAlloc.GetAddressOf()));
`;
    const blocks = parseSource(source, 'ch04');
    const code = blocks.flatMap((block) => block.kind === 'code' ? [block.text] : []).join('\n');

    expect(code).toContain('ComPtr<ID3D12RootSignature> mRootSignature;');
    expect(code).toContain('mCommandList->SetGraphicsRootSignature(mRootSignature.Get());');
    expect(code).toContain('D3D12_COMMAND_LIST_TYPE_DIRECT,');
    expect(blocks.some((block) => block.kind === 'paragraph' && block.text.startsWith('Direct3D is a low-level graphics API'))).toBe(true);
  });

  it('joins C++ structure declarations split into one text node per line', () => {
    const source = `
Chapter 5

COLOR REPRESENTATION

The library provides the following structure:

namespace DirectX

{

namespace PackedVector

{

struct XMCOLOR

{

union

{

struct

{

uint8_t b; // Blue component

uint8_t g; // Green component

};

uint32_t c;

XMCOLOR() {}

};
`;
    const blocks = parseSource(source, 'ch05');
    const codeBlocks = blocks.flatMap((block) => block.kind === 'code' ? [block.text] : []);

    expect(codeBlocks.join('\n')).toContain('namespace DirectX\n{\nnamespace PackedVector\n{\nstruct XMCOLOR\n{\nunion\n{\nstruct\n{\nuint8_t b; // Blue component\nuint8_t g; // Green component\n};\nuint32_t c;\nXMCOLOR() {}\n};');
    expect(codeBlocks).toHaveLength(1);
  });

  it('renders the real Chapter 5 packed color structure as one code block', () => {
    const blocks = parseSource(chapterFiveSource, 'ch05');
    const codeBlocks = blocks.flatMap((block) => block.kind === 'code' ? [block.text] : []);
    const packedColor = codeBlocks.find((code) => code.includes('struct XMCOLOR'));

    expect(packedColor).toContain('uint8_t b; // Blue: 0/255 to 255/255');
    expect(packedColor).toContain('uint32_t c;');
    expect(packedColor).toContain('XMCOLOR(float _r, float _g, float _b, float _a);');
    expect(packedColor).toContain('} // end PackedVector namespace');
  });

  it('keeps the full XMMATRIX float constructor in code and recognizes its alignment declaration', () => {
    const blocks = parseSource(chapterTwoSource, 'ch02');
    const codeBlocks = blocks.flatMap((block) => block.kind === 'code' ? [block.text] : []);
    const matrixStruct = codeBlocks.find((code) => code.includes('#if (defined(_M_IX86)'));

    expect(matrixStruct).toContain('__declspec(align(16)) struct XMMATRIX');
    expect(matrixStruct).toContain('XMMATRIX operator+ () const { return *this; }');
    expect(matrixStruct).toContain('XMMATRIX& XM_CALLCONV operator+= (FXMMATRIX M);');
    expect(matrixStruct).toContain('friend XMMATRIX XM_CALLCONV operator* (float S, FXMMATRIX M);');
    expect(matrixStruct).toContain(
      'XMMATRIX(float m00, float m01, float m02, float m03,\n' +
      'float m10, float m11, float m12, float m13,\n' +
      'float m20, float m21, float m22, float m23,\n' +
      'float m30, float m31, float m32, float m33);',
    );
    expect(matrixStruct).toContain('};');
    expect(matrixStruct).not.toContain('As you can see');
  });

  it('keeps the XMFLOAT4X4 float constructor parameters together as code', () => {
    const blocks = parseSource(chapterTwoSource, 'ch02');
    const code = blocks.flatMap((block) => block.kind === 'code' ? [block.text] : [])
      .find((block) => block.includes('XMFLOAT4X4(float m00'));

    expect(code).toContain(
      'XMFLOAT4X4(float m00, float m01, float m02, float m03,\n' +
      'float m10, float m11, float m12, float m13,\n' +
      'float m20, float m21, float m22, float m23,\n' +
      'float m30, float m31, float m32, float m33);',
    );
  });

  it('recognizes unfamiliar C++ types, wrapped calls, attributes, and HLSL signatures from syntax', () => {
    const source = `
Chapter 1

CODE PARSING

This paragraph mentions Widget and Create without showing code.

Widget<NativeHandle>* resource;

auto output = device->Create<NativeHandle>(

    input,

    fallback);

resource->Bind(output);

__declspec(align(16)) struct AlignedRecord

{

    float4 Position : SV_POSITION;

};

[numthreads(8, 8, 1)]

float4 Main(PixelInput input) : SV_Target

{

    return input.Color;

}

The Widget API is described in the next section.
`;
    const blocks = parseSource(source, 'ch01');
    const code = blocks.flatMap((block) => block.kind === 'code' ? [block.text] : []);
    const joined = code.join('\n');

    expect(joined).toContain('Widget<NativeHandle>* resource;');
    expect(joined).toContain('device->Create<NativeHandle>(\ninput,\nfallback);');
    expect(joined).toContain('__declspec(align(16)) struct AlignedRecord');
    expect(joined).toContain('[numthreads(8, 8, 1)]');
    expect(joined).toContain('float4 Main(PixelInput input) : SV_Target');
    expect(code.some((block) => block.includes('This paragraph mentions Widget'))).toBe(false);
    expect(blocks.some((block) => block.kind === 'paragraph' && block.text.startsWith('The Widget API'))).toBe(true);
  });

  it('keeps representative real HLSL declarations and calls in the English source blocks', () => {
    const chapterTwelve = parseSource(chapterTwelveSource, 'ch12');
    const chapterThirteen = parseSource(chapterThirteenSource, 'ch13');
    const chapterTwelveCode = chapterTwelve.flatMap((block) => block.kind === 'code' ? [block.text] : []);
    const chapterThirteenCode = chapterThirteen.flatMap((block) => block.kind === 'code' ? [block.text] : []);
    const code = [...chapterTwelveCode, ...chapterThirteenCode].join('\n');
    const geometryShader = chapterTwelveCode.find((block) => block.includes('void GS(point VertexOut gin[1],') && block.includes('triStream.Append(gout);'));
    const computeShader = chapterThirteenCode.find((block) => block.includes('void CS(int3 dispatchThreadID : SV_DispatchThreadID)'));

    expect(code).toContain('#include "LightingUtil.hlsl"');
    expect(code).toContain('Texture2DArray gTreeMapArray : register(t0);');
    expect(code).toContain('inout TriangleStream<GeoOut> triStream');
    expect(code).toContain('float4 PS(GeoOut pin) : SV_Target');
    expect(code).toContain('void CS(int3 dispatchThreadID : SV_DispatchThreadID)');
    expect(geometryShader).toContain('triStream.Append(gout);');
    expect(computeShader).toContain('gOutput[dispatchThreadID.xy]');
  });

  it('does not mistake chapter prose containing citations, semicolons, parentheses, or equations for code', () => {
    const blocks = parseSource(chapterOneSource, 'ch01');
    const code = blocks.flatMap((block) => block.kind === 'code' ? [block.text] : []).join('\n');
    const paragraphs = blocks.flatMap((block) => block.kind === 'paragraph' ? [block.text] : []);

    expect(paragraphs.some((text) => text.startsWith('Vectors play a crucial role in computer graphics'))).toBe(true);
    expect(paragraphs.some((text) => text.startsWith('A vector refers to a quantity that possesses both magnitude'))).toBe(true);
    expect(paragraphs.some((text) => text.startsWith('A first step in characterizing a vector mathematically'))).toBe(true);
    expect(code).not.toContain('we recommend [Verth04]');
    expect(code).not.toContain('Again we have that u = v');
    expect(code).not.toContain('move north (direction) ten meters (length)');
  });

  it('does not absorb natural-language rows into code blocks anywhere in the book', () => {
    const suspicious: string[] = [];

    for (const [path, source] of Object.entries(allBookSources)) {
      const sourceId = path.match(/\/(ch\d+|app[A-E]|intro)\.txt$/)?.[1] ?? 'source';
      for (const block of parseSource(source, sourceId)) {
        if (block.kind !== 'code') continue;
        for (const line of block.text.split('\n')) {
          const trimmed = line.trim();
          if (/^(?:\/\/|\/\*|\*|#)/.test(trimmed)) continue;
          const withoutComment = trimmed.replace(/\/\/.*$/, '');
          if (/\b[A-Za-z]{2,}\b(?:\s+\b[A-Za-z]{2,}\b){5}/.test(withoutComment)) {
            suspicious.push(`${path}: ${trimmed}`);
          }
        }
      }
    }

    expect(suspicious).toEqual([]);
  });
});
