/* 站点共享脚本：阅读进度条 / 完成打卡 / 侧栏高亮 */
(function () {
  // 阅读进度条
  var bar = document.createElement('div');
  bar.id = 'readbar';
  document.body.appendChild(bar);
  function onScroll() {
    var h = document.documentElement;
    var max = h.scrollHeight - h.clientHeight;
    bar.style.width = (max > 0 ? (h.scrollTop / max) * 100 : 0) + '%';
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // 完成打卡（按文件名记录）
  var doneRow = document.querySelector('.done-row input');
  if (doneRow) {
    var key = 'dx12zh-done-' + (location.pathname.split('/').pop() || 'index.html');
    doneRow.checked = localStorage.getItem(key) === '1';
    doneRow.addEventListener('change', function () {
      localStorage.setItem(key, doneRow.checked ? '1' : '0');
      document.dispatchEvent(new CustomEvent('dx12zh-progress'));
    });
  }

  // 首页章节卡片显示打卡状态
  document.querySelectorAll('.chap-card[data-done-key]').forEach(function (card) {
    var refresh = function () {
      var k = 'dx12zh-done-' + card.getAttribute('data-done-key');
      var done = localStorage.getItem(k) === '1';
      card.querySelector('.state').textContent = done ? '✓ 已读完' : '';
    };
    refresh();
    document.addEventListener('dx12zh-progress', refresh);
  });
})();
