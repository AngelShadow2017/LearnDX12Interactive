import { useMemo, useState } from 'react';
import { ActivityFrame } from '@/activities/ActivityFrame';
import { MatrixGrid, Readout } from '@/activities/controls';
import { determinant, identity, inverse, multiply, rotationY, scaling, type Mat4 } from '@/activities/math';

type Candidate = { id: string; label: string; note: string; matrix: Mat4; singular: boolean };

const candidates: Candidate[] = [
  { id: 'a', label: '缩放 (2, 3, 4)', note: '三个缩放因子都非零', matrix: scaling(2, 3, 4), singular: false },
  { id: 'b', label: '缩放 (1, 0, 1)', note: '沿 y 方向压成 0', matrix: scaling(1, 0, 1), singular: true },
  { id: 'c', label: '绕 y 轴旋转 45°', note: '纯旋转', matrix: rotationY(Math.PI / 4), singular: false },
  { id: 'd', label: '缩放 (2, 2, 2) 后有两行相同', note: '行向量线性相关', matrix: duplicatedRow(), singular: true },
];

function duplicatedRow(): Mat4 {
  const base = scaling(2, 2, 2);
  const copy = [...base];
  // 把第三行改成第一行，行列式立刻变成 0
  copy[8] = copy[0]; copy[9] = copy[1]; copy[10] = copy[2]; copy[11] = copy[3];
  return copy;
}

const answerIds = candidates.filter((candidate) => candidate.singular).map((candidate) => candidate.id);

/** 2.7 后的推演：判断哪些矩阵可逆，并用“乘回单位矩阵”验证。 */
export function MatrixInverseActivity() {
  const [picked, setPicked] = useState<string[]>([]);
  const [verified, setVerified] = useState(false);

  const results = useMemo(() => candidates.map((candidate) => {
    const det = determinant(candidate.matrix);
    const inverted = inverse(candidate.matrix);
    const product = inverted ? multiply(candidate.matrix, inverted) : null;
    const isIdentity = product ? product.every((value, index) => Math.abs(value - identity()[index]) < 1e-6) : false;
    return { candidate, det, inverted, product, isIdentity };
  }), []);

  function toggle(id: string) {
    setPicked((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
    setVerified(false);
  }

  function reset() {
    setPicked([]);
    setVerified(false);
  }

  const correct = picked.length === answerIds.length && picked.every((id) => answerIds.includes(id));

  return (
    <ActivityFrame
      id="ch02-matrix-inverse"
      chapterId="ch02"
      title="哪些矩阵可逆？乘回单位矩阵验证一次"
      prompt="勾选你认为不可逆的矩阵，然后点「用逆矩阵验证」——可逆的会乘回单位矩阵，不可逆的这里取不出逆矩阵。"
      predict={{
        question: '下面四个矩阵里，哪一类一定不可逆？',
        options: ['只要矩阵里有负数', '某个缩放因子为 0（或行向量线性相关）', '只要不是对称矩阵', '只要包含旋转'],
        answer: 1,
        hint: '行列式 det A = 0 时 A⁻¹ 不存在。沿某个方向压扁成 0 的缩放，行列式就是 0。',
        correctNote: 'det A = 0 ⟺ A 奇异（不可逆）。把某个方向压成 0 意味着信息丢失，无法还原。',
        wrongNote: '可逆性只由行列式决定：det A = 0 就不可逆。对称性和正负都不是判据，旋转矩阵 det = 1 一定可逆。',
      }}
      onReset={reset}
      check={() => {
        if (!correct) return { passed: false, feedback: `现在的勾选不对。提示：看 det 那一列，det = 0 的就是不可逆的。一共 ${answerIds.length} 个。` };
        return {
          passed: true,
          feedback: '正确。det A = 0 的矩阵（缩放因子含 0、或行向量线性相关）没有逆矩阵；其余的 A · A⁻¹ 都等于单位矩阵。',
        };
      }}
      explanation={<>
        <p>逆矩阵满足 A · A⁻¹ = A⁻¹ · A = I。只有<b>方阵</b>才可能有逆，而且必须 det A ≠ 0；det A = 0 的矩阵叫奇异矩阵。</p>
        <p>几何含义很直观：逆矩阵就是「把变换撤销」。如果某个缩放因子是 0，物体沿那个方向被压成了一条线——信息已经丢失，再怎么变换也回不去。</p>
        <p>公式上，A⁻¹ = A<sup>*</sup> / det A，其中 A<sup>*</sup> 是伴随矩阵（余子式矩阵的转置）。实际代码里直接调用 <code>XMMatrixInverse</code>，不用手算。</p>
        <p>第 3 章会用到它：坐标系变换矩阵和它的逆正好互为「来回」，法线变换也需要逆转置。</p>
      </>}
      apply={<p><code>XMMatrixInverse(nullptr, A)</code> 在矩阵奇异时会返回含 NaN 的结果，不会报错。用它之前先确认 det 非零，或者干脆保证缩放因子不为 0。</p>}
    >
      <div className="ctl-panel">
        <span className="ctl-panel__title">勾选你认为不可逆的矩阵</span>
        {results.map(({ candidate, det, isIdentity, inverted }) => <div key={candidate.id} style={{ marginBottom: 12 }}>
          <label className="ctl ctl--toggle">
            <input type="checkbox" checked={picked.includes(candidate.id)} onChange={() => toggle(candidate.id)} />
            <span><b>{candidate.label}</b>　<small style={{ color: '#8b9589' }}>{candidate.note}</small></span>
          </label>
          <Readout items={[
            ['det A', det.toFixed(3)],
            ['A⁻¹', inverted ? '存在' : '不存在'],
            ['A · A⁻¹ = I', inverted ? (isIdentity ? '是' : '否') : '—'],
          ]} />
          {verified && inverted && <MatrixGrid matrix={inverted} />}
        </div>)}
      </div>

      <div className="activity__actions">
        <button className="button button--outline" type="button" onClick={() => setVerified(true)}>用逆矩阵验证</button>
      </div>
      {verified && <p className="activity__hint">
        <b>验证结果</b>展开的矩阵是每个 A 的 A⁻¹。可以看到 det = 0 的两个矩阵取不到逆矩阵；其余的 A · A⁻¹ 都等于单位矩阵（对角线为 1，其余为 0）。
      </p>}

      <Readout items={[
        ['已勾选', `${picked.length} 个`],
        ['实际不可逆', `${answerIds.length} 个`],
      ]} />
      <p className="draggable-note">提示：把向量 (1, 1, 1) 分别送进这几个矩阵，看看「压成 0」的那个是不是真的丢了一个方向的信息。</p>
    </ActivityFrame>
  );
}
