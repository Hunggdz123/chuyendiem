if (sessionStorage.getItem('transferAuthenticated') !== 'true') {
  window.location.replace('login.html');
}

const transferForm = document.getElementById('transferForm');
const verifyBox = document.querySelector('.verify-box');
const noticeDialog = document.getElementById('noticeDialog');
const noticeMessage = document.getElementById('noticeMessage');
const noticeClose = document.getElementById('noticeClose');
const logoutButton = document.getElementById('logoutButton');
const pointBalance = document.getElementById('pointBalance');
const addPointsForm = document.getElementById('addPointsForm');
const pointsToAdd = document.getElementById('pointsToAdd');
const transferHistory = document.getElementById('transferHistory');
const transferRateProgress = document.getElementById('transferRateProgress');
const stateKey = 'transferAppState';
let isHumanVerified = false;
let focusAfterNotice = null;

function loadAppState() {
  const savedState = localStorage.getItem(stateKey);
  if (!savedState) {
    return { balance: 0, history: [], result: null, attemptsInBatch: 0, successesInBatch: 0, successSchedule: null };
  }

  try {
    const state = JSON.parse(savedState);
    if (
      !state ||
      !Number.isSafeInteger(state.balance) ||
      state.balance < 0 ||
      !Array.isArray(state.history) ||
      (state.attemptsInBatch !== undefined &&
        (!Number.isInteger(state.attemptsInBatch) || state.attemptsInBatch < 0 || state.attemptsInBatch > 9)) ||
      (state.successesInBatch !== undefined &&
        (!Number.isInteger(state.successesInBatch) || state.successesInBatch < 0 || state.successesInBatch > 4)) ||
      (state.successSchedule !== undefined &&
        state.successSchedule !== null &&
        (!Array.isArray(state.successSchedule) ||
          state.successSchedule.length !== 10 ||
          state.successSchedule.filter(Boolean).length !== 4))
    ) {
      throw new Error('Dữ liệu số dư hoặc lịch sử không hợp lệ.');
    }
    state.attemptsInBatch = state.attemptsInBatch || 0;
    state.successesInBatch = state.successesInBatch || 0;
    state.successSchedule = state.successSchedule || null;
    return state;
  } catch (error) {
    console.error('Không thể đọc dữ liệu chuyển điểm đã lưu.', error);
    showNotice('Không thể đọc dữ liệu điểm đã lưu. Vui lòng kiểm tra bộ nhớ trình duyệt.', pointsToAdd);
    return { balance: 0, history: [], result: null, attemptsInBatch: 0, successesInBatch: 0, successSchedule: null };
  }
}

let appState = loadAppState();

function createSuccessSchedule() {
  const schedule = [true, true, true, true, false, false, false, false, false, false];
  for (let index = schedule.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [schedule[index], schedule[swapIndex]] = [schedule[swapIndex], schedule[index]];
  }
  return schedule;
}

function saveAppState() {
  localStorage.setItem(stateKey, JSON.stringify(appState));
}

function renderState() {
  pointBalance.textContent = appState.balance.toLocaleString('vi-VN');
  transferRateProgress.textContent = 'Đợt hiện tại: ' + appState.attemptsInBatch +
    '/10 lần hợp lệ · ' + appState.successesInBatch + '/4 lượt thành công';
  transferHistory.replaceChildren();

  if (appState.history.length === 0) {
    const emptyMessage = document.createElement('p');
    emptyMessage.className = 'history-empty';
    emptyMessage.textContent = 'Chưa có giao dịch chuyển điểm.';
    transferHistory.appendChild(emptyMessage);
    return;
  }

  appState.history.forEach(function (item) {
    const entry = document.createElement('article');
    entry.className = 'history-entry';

    const details = document.createElement('div');
    details.className = 'history-details';
    const accounts = document.createElement('strong');
    accounts.textContent = item.sourceAccount + ' → ' + item.targetAccount;
    const date = document.createElement('time');
    date.textContent = item.transferDate;
    details.append(accounts, date);

    const summary = document.createElement('div');
    summary.className = 'history-summary';
    const amount = document.createElement('strong');
    amount.textContent = item.amount.toLocaleString('vi-VN') + ' điểm';
    const status = document.createElement('span');
    status.className = item.status === 'success' ? 'history-status is-success' : 'history-status is-failed';
    status.textContent = item.status === 'success' ? 'Thành công' : 'Thất bại';
    summary.append(amount, status);

    entry.append(details, summary);
    transferHistory.appendChild(entry);
  });
}

renderState();

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

addPointsForm.addEventListener('submit', function (event) {
  event.preventDefault();
  const amount = Number(pointsToAdd.value);

  if (!Number.isSafeInteger(amount) || amount <= 0) {
    showNotice('Nhập số điểm cần cộng là số nguyên lớn hơn 0.', pointsToAdd);
    return;
  }

  if (!Number.isSafeInteger(appState.balance + amount)) {
    showNotice('Tổng điểm sau khi cộng vượt quá giới hạn cho phép.', pointsToAdd);
    return;
  }

  appState.balance += amount;
  saveAppState();
  pointsToAdd.value = '';
  renderState();
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
    if (!Number.isSafeInteger(amount) || amount <= 0) {
      showNotice('Số điểm chuyển phải là số nguyên lớn hơn 0.', document.getElementById('transferAmount'));
      return;
    }

    if (!isHumanVerified) {
      showNotice('Vui lòng xác nhận "Verify you are human" trước khi chuyển điểm.', verifyBox);
      return;
    }

    if (sourceAccount === targetAccount) {
      showNotice('Tài khoản nguồn và tài khoản đến phải khác nhau.', document.getElementById('targetAccount'));
      return;
    }

    if (!appState.successSchedule) {
      appState.successSchedule = createSuccessSchedule();
    }

    const batchAttempt = appState.attemptsInBatch + 1;
    const scheduledSuccess = appState.successSchedule[appState.attemptsInBatch];
    const succeeded = scheduledSuccess && amount <= appState.balance;
    const failureReason = !scheduledSuccess ? 'rate' : succeeded ? null : 'balance';
    if (succeeded) {
      appState.balance -= amount;
      appState.successesInBatch += 1;
    }

    const result = {
      sourceAccount,
      targetAccount,
      amount,
      transferDate: new Date().toLocaleString('vi-VN'),
      status: succeeded ? 'success' : 'failed',
      failureReason,
      batchAttempt,
      balanceAfter: appState.balance
    };

    appState.history.unshift(result);
    appState.result = result;
    appState.attemptsInBatch = batchAttempt === 10 ? 0 : batchAttempt;
    if (batchAttempt === 10) {
      appState.successesInBatch = 0;
      appState.successSchedule = null;
    }
    saveAppState();
    window.location.href = 'result.html';
  });
}
