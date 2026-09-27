const transferForm = document.getElementById('transferForm');
const verifyBox = document.querySelector('.verify-box');
let isHumanVerified = false;

if (verifyBox) {
  verifyBox.addEventListener('click', function () {
    isHumanVerified = true;
    verifyBox.setAttribute('aria-pressed', 'true');
    verifyBox.dataset.verified = 'true';
    verifyBox.classList.add('is-verified');
  });
}

if (transferForm) {
  transferForm.addEventListener('submit', function (event) {
    event.preventDefault();

    const sourceAccount = document.getElementById('sourceAccount').value.trim();
    const targetAccount = document.getElementById('targetAccount').value.trim();
    const transferAmount = document.getElementById('transferAmount').value.trim();

    if (!sourceAccount || !targetAccount || !transferAmount) {
      alert('Vui lòng nhập đầy đủ tài khoản nguồn, tài khoản đến và số điểm chuyển.');
      return;
    }

    const amount = Number(transferAmount);
    if (Number.isNaN(amount) || amount <= 0) {
      alert('Số điểm chuyển phải lớn hơn 0.');
      return;
    }

    if (!isHumanVerified) {
      alert('Vui lòng xác nhận "Verify you are human" trước khi chuyển điểm.');
      return;
    }

    const submitButton = transferForm.querySelector('button[type="submit"]');
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = 'Đang xử lý...';
      submitButton.style.opacity = '0.8';

      setTimeout(() => {
        const result = {
          sourceAccount,
          targetAccount,
          amount,
          transferDate: new Date().toLocaleString('vi-VN'),
          status: 'Chuyển thành công'
        };

        localStorage.setItem('transferResult', JSON.stringify(result));
        window.location.href = 'result.html';
      }, 800);
    }
  });
}
