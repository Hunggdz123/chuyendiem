if (sessionStorage.getItem('transferAuthenticated') !== 'true') {
  window.location.replace('login.html');
}

const transferForm = document.getElementById('transferForm');
const verifyBox = document.querySelector('.verify-box');
const noticeDialog = document.getElementById('noticeDialog');
const noticeMessage = document.getElementById('noticeMessage');
const noticeClose = document.getElementById('noticeClose');
const logoutButton = document.getElementById('logoutButton');
let isHumanVerified = false;
let focusAfterNotice = null;

if (logoutButton) {
  logoutButton.addEventListener('click', function () {
    sessionStorage.removeItem('transferAuthenticated');
    window.location.replace('login.html');
  });
}

function showNotice(message, focusTarget) {
  noticeMessage.textContent = message;
  focusAfterNotice = focusTarget;
  noticeDialog.showModal();
}

noticeClose.addEventListener('click', function () {
  noticeDialog.close();
});

noticeDialog.addEventListener('close', function () {
  if (focusAfterNotice) {
    focusAfterNotice.focus();
    focusAfterNotice = null;
  }
});

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

    if (sourceAccount && sourceAccount.length < 7) {
      showNotice('Tài khoản nguồn phải có ít nhất 7 ký tự.', document.getElementById('sourceAccount'));
      return;
    }

    if (targetAccount && targetAccount.length < 7) {
      showNotice('Tài khoản đến phải có ít nhất 7 ký tự.', document.getElementById('targetAccount'));
      return;
    }

    if (!sourceAccount || !targetAccount || !transferAmount) {
      const missingField = !sourceAccount
        ? document.getElementById('sourceAccount')
        : !targetAccount
          ? document.getElementById('targetAccount')
          : document.getElementById('transferAmount');
      showNotice('Vui lòng nhập đầy đủ tài khoản nguồn, tài khoản đến và số điểm chuyển.', missingField);
      return;
    }

    const amount = Number(transferAmount);
    if (Number.isNaN(amount) || amount <= 0) {
      showNotice('Số điểm chuyển phải lớn hơn 0.', document.getElementById('transferAmount'));
      return;
    }

    if (!isHumanVerified) {
      showNotice('Vui lòng xác nhận "Verify you are human" trước khi chuyển điểm.', verifyBox);
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
