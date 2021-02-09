const html = document.querySelector("html");
const checkbox = document.querySelector("input[name=theme]");

const getStyle = (element, style) => window.getComputedStyle(element).getPropertyValue(style);

const initialColors = {
    bg: getStyle(html, "--bg"),
    darkGreen: getStyle(html, "--dark-green"),
    cardBg: getStyle(html, "--card-bg"),
    green: getStyle(html, "--green"),
    darkBlue: getStyle(html, "--dark-blue"),
};

const darkMode = {
    bg: "#06090f",
    darkGreen: "#161b22",
    cardBg: "#0d1117",
    green: " #12a454",
    darkBlue: "#58a6f0",
};

const transformKey = key => "--" + key.replace(/([A-Z])/g, "-$1").toLowerCase();


const changeColors = (colors) => {
    Object.keys(colors).map(key => html.style.setProperty(transformKey(key), colors[key]));
}

checkbox.addEventListener("change", ({target}) => {
    target.checked ? changeColors(darkMode) : changeColors(initialColors)
});

const Modal = {
    toggle() {
        document.querySelector(".modal-overlay")
            .classList.toggle('active');
    }
};

const Storage = {
    get() {
        return JSON.parse(localStorage.getItem("dev.finances: transactions")) || [];
    },

    set(transactions) {
        localStorage.setItem("dev.finances: transactions", JSON.stringify(transactions));
    }
};

const Transaction = {
    all: Storage.get(),

    add(transaction) {
        Transaction.all.push(transaction);
        App.reload();
    },

    remove(index) {
        Transaction.all.splice(index, 1);
        App.reload();
    },

    incomes() {
        let income = 0;

        Transaction.all.forEach(transacation => {
            if (transacation.amount > 0) {
                income += transacation.amount;
            }
        });

        return income;
    },
    expenses() {
        let expense = 0;

        Transaction.all.forEach(transacation => {
            if (transacation.amount < 0) {
                expense += transacation.amount;
            }
        });

        return expense;
    },
    total() {
        return Transaction.incomes() + Transaction.expenses();
    }
};

const DOM = {
    transactionsContainer: document.querySelector('#data-table tbody'),

    addTransaction(transaction, index) {
        const tr = document.createElement('tr');
        tr.innerHTML = DOM.innerHTMLTransaction(transaction, index);
        tr.dataset.index = index;

        DOM.transactionsContainer.appendChild(tr);
    },

    innerHTMLTransaction(transaction, index) {
        const cssCLass = transaction.amount > 0 ? "income" : "expense";

        const amount = Utils.formatCurrency(transaction.amount);

        const html = `
            <td class="description">${transaction.description}</td>
            <td class="${cssCLass}">${amount}</td>
            <td class="date">${transaction.date}</td>
            <td>
                <img onclick="Transaction.remove(${index})" src="./assets/minus.svg" alt="Remover Transação">
            </td>
        `;

        return html;
    },

    updateBalance() {
        document.getElementById('income-display').innerHTML = Utils.formatCurrency(Transaction.incomes());
        document.getElementById('expense-display').innerHTML = Utils.formatCurrency(Transaction.expenses());
        document.getElementById('total-display').innerHTML = Utils.formatCurrency(Transaction.total());
    },

    clearTransactions() {
        DOM.transactionsContainer.innerHTML = "";
    }
};

const Utils = {
    formatCurrency(value) {
        const signal = Number(value) < 0 ? "-" : "";

        value = String(value).replace(/\D/g, "");

        value = Number(value) / 100;

        value = value.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        });

        return signal + value;
    },

    formatAmount(value) {
        value = value * 100;

        return Math.round(value);
    },

    formatDate(date) {
        const splittedDate = date.split("-")
        return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`;
    }
};

const Form = {
    description: document.querySelector('input#description'),
    amount: document.querySelector('input#amount'),
    date: document.querySelector('input#date'),

    getValues() {
        return {
            description: Form.description.value,
            amount: Form.amount.value,
            date: Form.date.value
        }
    },

    validateFields() {
        const { description, amount, date } = Form.getValues();

        if (description.trim() === "" ||
            amount.trim() === "" ||
            date.trim() === "") {
            throw new Error("Por favor, preencha todos os campos")
        }
    },

    formatData() {
        let { description, amount, date } = Form.getValues();
        amount = Utils.formatAmount(amount);

        date = Utils.formatDate(date);

        return {
            description,
            amount,
            date
        }
    },

    clearFields() {
        Form.description.value = "";
        Form.amount.value = "";
        Form.date.value = "";
    },

    submit(event) {
        event.preventDefault();

        try {
            Form.validateFields()
            const transaction = Form.formatData()
            Transaction.add(transaction)
            Form.clearFields()
            Modal.toggle()
        } catch (error) {
            alert(error.message)
        }
    }
};

const App = {
    init() {
        Transaction.all.forEach(function (transaction, index) {
            DOM.addTransaction(transaction, index);
        });

        DOM.updateBalance();

        Storage.set(Transaction.all);
    },
    reload() {
        DOM.clearTransactions();
        App.init();
    }
};

App.init();