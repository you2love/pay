// 支付模拟器逻辑
const transactions = [];

const paymentForm = document.getElementById('payment-form');
const submitBtn = document.getElementById('submit-btn');
const alertMessage = document.getElementById('alert-message');
const transactionList = document.getElementById('transaction-list');
const transactionStats = document.getElementById('transaction-stats');

// 支付方式映射（2026年更新）
const paymentMethodMap = {
    'alipay': '支付宝',
    'wechat': '微信支付',
    'digitalrmb': '数字人民币（e-CNY）',
    'biometric': '生物识别支付',
    'web3': 'Web3加密货币',
    'bnpl': '先买后付（BNPL）'
};

// 显示提示信息
function showAlert(message, type) {
    alertMessage.innerHTML = `<div class="alert alert-${type}">${message}</div>`;
    setTimeout(() => {
        alertMessage.innerHTML = '';
    }, 5000);
}

// 生成订单号
function generateOrderId() {
    return 'ORD' + Date.now();
}

// 格式化时间
function formatTime(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleString('zh-CN');
}

// 渲染交易记录
function renderTransactions() {
    if (transactions.length === 0) {
        transactionList.innerHTML = `
            <div class="alert alert-info">
                暂无交易记录，请发起一笔支付
            </div>
        `;
        transactionStats.style.display = 'none';
        return;
    }

    let html = '<table class="transaction-table"><thead><tr><th>订单号</th><th>金额</th><th>方式</th><th>状态</th><th>操作</th></tr></thead><tbody>';

    transactions.forEach(tx => {
        let statusBadge = '';
        let actionButton = '';

        if (tx.status === 'success') {
            statusBadge = '<span class="badge badge-success">成功</span>';
            actionButton = `<button class="btn btn-sm" onclick="handleRefund('${tx.id}')" style="background: #f39c12; color: #fff; border: none;">退款</button>`;
        } else if (tx.status === 'failed') {
            statusBadge = '<span class="badge badge-danger">失败</span>';
        } else if (tx.status === 'cancelled') {
            statusBadge = '<span class="badge badge-warning">已退款</span>';
        }

        html += `
            <tr>
                <td><small>${tx.id}</small></td>
                <td>¥${tx.amount.toFixed(2)}</td>
                <td>${tx.method}</td>
                <td>${statusBadge}</td>
                <td>${actionButton}</td>
            </tr>
        `;
    });

    html += '</tbody></table>';
    transactionList.innerHTML = html;

    // 更新统计信息
    updateStats();
}

// 更新统计信息
function updateStats() {
    const totalCount = transactions.length;
    const successTransactions = transactions.filter(t => t.status === 'success');
    const successCount = successTransactions.length;
    const totalAmount = successTransactions.reduce((sum, t) => sum + t.amount, 0);

    document.getElementById('total-count').textContent = totalCount;
    document.getElementById('success-count').textContent = successCount;
    document.getElementById('total-amount').textContent = `¥${totalAmount.toFixed(2)}`;

    transactionStats.style.display = 'block';
}

// 处理支付提交
paymentForm.addEventListener('submit', function(e) {
    e.preventDefault();

    const amountInput = document.getElementById('amount');
    const amount = parseFloat(amountInput.value);
    const paymentMethod = document.getElementById('payment-method').value;

    if (!amount || amount <= 0) {
        showAlert('请输入有效的支付金额', 'error');
        return;
    }

    // 显示加载状态
    submitBtn.disabled = true;
    submitBtn.textContent = '处理中...';

    // 模拟支付处理（2秒延迟）
    setTimeout(() => {
        const isSuccess = Math.random() > 0.2; // 80% 成功率

        const transaction = {
            id: generateOrderId(),
            amount: amount,
            status: isSuccess ? 'success' : 'failed',
            method: paymentMethodMap[paymentMethod],
            timestamp: Date.now()
        };

        transactions.unshift(transaction);
        renderTransactions();

        // 恢复按钮状态
        submitBtn.disabled = false;
        submitBtn.textContent = '立即支付';

        if (isSuccess) {
            showAlert(`支付成功！订单号：${transaction.id}，金额：¥${amount.toFixed(2)}`, 'success');
            amountInput.value = '';
        } else {
            showAlert('支付失败，请稍后重试', 'error');
        }
    }, 2000);
});

// 处理退款
window.handleRefund = function(orderId) {
    const transaction = transactions.find(t => t.id === orderId);
    if (transaction && transaction.status === 'success') {
        transaction.status = 'cancelled';
        renderTransactions();
        showAlert(`退款成功！订单号：${orderId}`, 'info');
    }
};