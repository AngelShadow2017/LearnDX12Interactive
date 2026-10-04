import { describe, expect, it } from 'vitest';
import chapterFiveSource from '../content/source/ch05.txt?raw';
import chapterTwoSource from '../content/source/ch02.txt?raw';
import { parseSource } from './OriginalBookText';

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
});
