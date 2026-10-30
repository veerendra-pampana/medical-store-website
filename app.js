const storageKey = "medistore-manager-data-v1";

const sampleData = {
  medicines: [
    {
      id: crypto.randomUUID(),
      name: "Paracetamol 500mg",
      category: "Tablet",
      batch: "PCM2401",
      supplier: "Wellcare Pharma",
      purchasePrice: 1.2,
      sellingPrice: 2.5,
      quantity: 180,
      reorderLevel: 50,
      expiryDate: "2027-01-12",
      gstRate: 12,
    },
    {
      id: crypto.randomUUID(),
      name: "Amoxicillin 250mg",
      category: "Capsule",
      batch: "AMX2330",
      supplier: "Cureline Distributors",
      purchasePrice: 4.8,
      sellingPrice: 8.5,
      quantity: 24,
      reorderLevel: 30,
      expiryDate: "2026-07-05",
      gstRate: 12,
    },
    {
      id: crypto.randomUUID(),
      name: "Cough Relief Syrup",
      category: "Syrup",
      batch: "CRS1120",
      supplier: "Medico Supply Co.",
      purchasePrice: 42,
      sellingPrice: 72,
      quantity: 36,
      reorderLevel: 12,
      expiryDate: "2026-12-22",
      gstRate: 12,
    },
    {
      id: crypto.randomUUID(),
      name: "Digital Thermometer",
      category: "Device",
      batch: "DT7782",
      supplier: "Care Devices",
      purchasePrice: 95,
      sellingPrice: 165,
      quantity: 9,
      reorderLevel: 10,
      expiryDate: "2030-01-01",
      gstRate: 18,
    },
  ],
  customers: [
    {
      id: crypto.randomUUID(),
      name: "Anil Kumar",
      phone: "9876543210",
      reason: "Fever and body pain",
      totalCost: 125,
    },
    {
      id: crypto.randomUUID(),
      name: "Meera Shah",
      phone: "9988776655",
      reason: "Antibiotic course for infection",
      totalCost: 340,
    },
  ],
  sales: [],
};

const medicineKnowledge = [
  {
    keys: ["paracetamol", "acetaminophen"],
    name: "Paracetamol",
    info:
      "Paracetamol is commonly used for fever and mild to moderate pain. Avoid giving dosing advice from this app; check age, weight, liver disease history, alcohol use, and other medicines before sale.",
  },
  {
    keys: ["amoxicillin", "amoxycillin"],
    name: "Amoxicillin",
    info:
      "Amoxicillin is an antibiotic used for some bacterial infections when prescribed. Do not suggest it for viral cough/cold symptoms, and ask customers to follow a doctor's prescription and complete the prescribed course.",
  },
  {
    keys: ["cetirizine"],
    name: "Cetirizine",
    info:
      "Cetirizine is an antihistamine commonly used for allergy symptoms such as sneezing, runny nose, and itching. It may cause sleepiness in some people.",
  },
  {
    keys: ["ibuprofen"],
    name: "Ibuprofen",
    info:
      "Ibuprofen is an NSAID used for pain, inflammation, and fever. It may not be suitable for some people with stomach ulcers, kidney disease, blood thinner use, or late pregnancy.",
  },
  {
    keys: ["omeprazole"],
    name: "Omeprazole",
    info:
      "Omeprazole reduces stomach acid and is used for acidity, reflux, and ulcer-related conditions. Long-term use should be reviewed by a clinician.",
  },
  {
    keys: ["ors", "oral rehydration"],
    name: "ORS",
    info:
      "ORS helps replace fluids and salts during dehydration from diarrhea, vomiting, or heat. Severe dehydration, blood in stool, persistent vomiting, infants, elderly patients, and pregnancy need medical attention.",
  },
];

let state = loadState();
let billItems = [];

const elements = {
  pageTitle: document.querySelector("#pageTitle"),
  navLinks: document.querySelectorAll(".nav-link"),
  views: document.querySelectorAll(".view"),
  totalMedicines: document.querySelector("#totalMedicines"),
  lowStockCount: document.querySelector("#lowStockCount"),
  emptyStockCount: document.querySelector("#emptyStockCount"),
  expiringSoonCount: document.querySelector("#expiringSoonCount"),
  totalRevenue: document.querySelector("#totalRevenue"),
  stockNotificationPanel: document.querySelector("#stockNotificationPanel"),
  stockNotificationTitle: document.querySelector("#stockNotificationTitle"),
  stockNotificationText: document.querySelector("#stockNotificationText"),
  enableNotifications: document.querySelector("#enableNotifications"),
  lowStockTable: document.querySelector("#lowStockTable"),
  expiryTable: document.querySelector("#expiryTable"),
  medicineForm: document.querySelector("#medicineForm"),
  medicineId: document.querySelector("#medicineId"),
  medicineName: document.querySelector("#medicineName"),
  medicineCategory: document.querySelector("#medicineCategory"),
  medicineBatch: document.querySelector("#medicineBatch"),
  medicineSupplier: document.querySelector("#medicineSupplier"),
  purchasePrice: document.querySelector("#purchasePrice"),
  sellingPrice: document.querySelector("#sellingPrice"),
  quantity: document.querySelector("#quantity"),
  reorderLevel: document.querySelector("#reorderLevel"),
  expiryDate: document.querySelector("#expiryDate"),
  gstRate: document.querySelector("#gstRate"),
  clearMedicineForm: document.querySelector("#clearMedicineForm"),
  inventorySearch: document.querySelector("#inventorySearch"),
  inventoryTable: document.querySelector("#inventoryTable"),
  billCustomer: document.querySelector("#billCustomer"),
  billDiscount: document.querySelector("#billDiscount"),
  billMedicine: document.querySelector("#billMedicine"),
  billQuantity: document.querySelector("#billQuantity"),
  addToBill: document.querySelector("#addToBill"),
  billItemsTable: document.querySelector("#billItemsTable"),
  billSubtotal: document.querySelector("#billSubtotal"),
  billTax: document.querySelector("#billTax"),
  billDiscountAmount: document.querySelector("#billDiscountAmount"),
  billTotal: document.querySelector("#billTotal"),
  completeSale: document.querySelector("#completeSale"),
  printInvoice: document.querySelector("#printInvoice"),
  invoiceNumber: document.querySelector("#invoiceNumber"),
  customerForm: document.querySelector("#customerForm"),
  customerId: document.querySelector("#customerId"),
  customerName: document.querySelector("#customerName"),
  customerPhone: document.querySelector("#customerPhone"),
  customerReason: document.querySelector("#customerReason"),
  customerCost: document.querySelector("#customerCost"),
  clearCustomerForm: document.querySelector("#clearCustomerForm"),
  customerSearch: document.querySelector("#customerSearch"),
  customersTable: document.querySelector("#customersTable"),
  salesSearch: document.querySelector("#salesSearch"),
  salesTable: document.querySelector("#salesTable"),
  invoiceDialog: document.querySelector("#invoiceDialog"),
  invoiceContent: document.querySelector("#invoiceContent"),
  closeInvoice: document.querySelector("#closeInvoice"),
  toast: document.querySelector("#toast"),
  seedDataButton: document.querySelector("#seedDataButton"),
  resetDataButton: document.querySelector("#resetDataButton"),
  logoutButton: document.querySelector("#logoutButton"),
  loggedInUser: document.querySelector("#loggedInUser"),
  botMessages: document.querySelector("#botMessages"),
  botForm: document.querySelector("#botForm"),
  botInput: document.querySelector("#botInput"),
};

function loadState() {
  const stored = localStorage.getItem(storageKey);
  if (!stored) {
    return { medicines: [], customers: [], sales: [] };
  }

  try {
    return JSON.parse(stored);
  } catch {
    return { medicines: [], customers: [], sales: [] };
  }
}

function saveState() {
  localStorage.setItem(storageKey, JSON.stringify(state));
}

function money(value) {
  return `Rs ${Number(value || 0).toFixed(2)}`;
}

function formatDate(value) {
  return new Intl.DateTimeFormat("en-IN", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(new Date(value));
}

function daysUntil(dateValue) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateValue);
  target.setHours(0, 0, 0, 0);
  return Math.ceil((target - today) / 86400000);
}

function toast(message) {
  elements.toast.textContent = message;
  elements.toast.classList.add("show");
  clearTimeout(toast.timeout);
  toast.timeout = setTimeout(() => elements.toast.classList.remove("show"), 2200);
}

function emptyRow(colspan, message) {
  return `<tr><td colspan="${colspan}" class="empty-state">${message}</td></tr>`;
}

function statusTag(medicine) {
  const expiryDays = daysUntil(medicine.expiryDate);
  if (medicine.quantity === 0) return `<span class="tag tag-danger">Empty</span>`;
  if (expiryDays < 0) return `<span class="tag tag-danger">Expired</span>`;
  if (expiryDays <= 60) return `<span class="tag tag-warn">Expiring</span>`;
  if (medicine.quantity <= medicine.reorderLevel) return `<span class="tag tag-warn">Low Stock</span>`;
  return `<span class="tag tag-ok">Available</span>`;
}

function getCriticalStock() {
  return state.medicines
    .filter((medicine) => medicine.quantity <= medicine.reorderLevel)
    .sort((a, b) => a.quantity - b.quantity || a.name.localeCompare(b.name));
}

function notifyLowStockIfNeeded() {
  const criticalStock = getCriticalStock();
  const emptyStock = criticalStock.filter((medicine) => medicine.quantity === 0);
  elements.stockNotificationPanel.classList.toggle("alert", criticalStock.length > 0);

  if (!criticalStock.length) {
    elements.stockNotificationTitle.textContent = "Stock is healthy";
    elements.stockNotificationText.textContent = "No medicine is close to empty right now.";
    return;
  }

  const names = criticalStock.slice(0, 4).map((medicine) => `${medicine.name} (${medicine.quantity} left)`).join(", ");
  elements.stockNotificationTitle.textContent = emptyStock.length
    ? `${emptyStock.length} medicine${emptyStock.length > 1 ? "s are" : " is"} empty`
    : `${criticalStock.length} medicine${criticalStock.length > 1 ? "s are" : " is"} going empty`;
  elements.stockNotificationText.textContent = `${names}${criticalStock.length > 4 ? "..." : ""}. Please reorder soon.`;
}

function renderAll() {
  renderDashboard();
  renderInventory();
  renderBillingSelectors();
  renderBill();
  renderCustomers();
  renderSales();
}

function renderDashboard() {
  const lowStock = getCriticalStock();
  const emptyStock = state.medicines.filter((medicine) => medicine.quantity === 0);
  const expiringSoon = state.medicines.filter((medicine) => {
    const days = daysUntil(medicine.expiryDate);
    return days >= 0 && days <= 60;
  });
  const revenue = state.sales.reduce((sum, sale) => sum + sale.total, 0);

  elements.totalMedicines.textContent = state.medicines.length;
  elements.lowStockCount.textContent = lowStock.length;
  elements.emptyStockCount.textContent = emptyStock.length;
  elements.expiringSoonCount.textContent = expiringSoon.length;
  elements.totalRevenue.textContent = money(revenue);
  notifyLowStockIfNeeded();

  elements.lowStockTable.innerHTML = lowStock.length
    ? lowStock
        .map(
          (medicine) => `
        <tr>
          <td>${medicine.name}</td>
          <td>${medicine.batch}</td>
          <td>${medicine.quantity}</td>
          <td>${medicine.reorderLevel}</td>
          <td>${statusTag(medicine)}</td>
        </tr>`
        )
        .join("")
    : emptyRow(5, "No low stock alerts.");

  elements.expiryTable.innerHTML = expiringSoon.length
    ? expiringSoon
        .map(
          (medicine) => `
        <tr>
          <td>${medicine.name}</td>
          <td>${medicine.batch}</td>
          <td>${formatDate(medicine.expiryDate)}</td>
          <td>${medicine.quantity}</td>
        </tr>`
        )
        .join("")
    : emptyRow(4, "No medicines expiring soon.");
}

function renderInventory() {
  const query = elements.inventorySearch.value.trim().toLowerCase();
  const medicines = state.medicines.filter((medicine) =>
    [medicine.name, medicine.batch, medicine.category, medicine.supplier].join(" ").toLowerCase().includes(query)
  );

  elements.inventoryTable.innerHTML = medicines.length
    ? medicines
        .map(
          (medicine) => `
        <tr>
          <td>
            <strong>${medicine.name}</strong><br />
            ${statusTag(medicine)}
          </td>
          <td>${medicine.batch}</td>
          <td>${medicine.category}</td>
          <td>${medicine.quantity}</td>
          <td>${money(medicine.sellingPrice)}</td>
          <td>${formatDate(medicine.expiryDate)}</td>
          <td>
            <div class="row-actions">
              <button class="ghost-button" data-edit-medicine="${medicine.id}">Edit</button>
              <button class="danger-button" data-delete-medicine="${medicine.id}">Delete</button>
            </div>
          </td>
        </tr>`
        )
        .join("")
    : emptyRow(7, "No medicines found.");
}

function renderBillingSelectors() {
  elements.billCustomer.innerHTML = [
    `<option value="">Walk-in Customer</option>`,
    ...state.customers.map((customer) => `<option value="${customer.id}">${customer.name} - ${customer.phone}</option>`),
  ].join("");

  const availableMedicines = state.medicines.filter((medicine) => medicine.quantity > 0 && daysUntil(medicine.expiryDate) >= 0);
  elements.billMedicine.innerHTML = availableMedicines.length
    ? availableMedicines
        .map(
          (medicine) =>
            `<option value="${medicine.id}">${medicine.name} | Batch ${medicine.batch} | Stock ${medicine.quantity}</option>`
        )
        .join("")
    : `<option value="">No available stock</option>`;
}

function calculateBill() {
  const subtotal = billItems.reduce((sum, item) => sum + item.quantity * item.sellingPrice, 0);
  const tax = billItems.reduce((sum, item) => sum + item.quantity * item.sellingPrice * (item.gstRate / 100), 0);
  const discountRate = Number(elements.billDiscount.value || 0);
  const discount = (subtotal + tax) * (discountRate / 100);
  const total = subtotal + tax - discount;
  return { subtotal, tax, discount, total };
}

function renderBill() {
  elements.billItemsTable.innerHTML = billItems.length
    ? billItems
        .map((item) => {
          const lineTax = item.quantity * item.sellingPrice * (item.gstRate / 100);
          const lineTotal = item.quantity * item.sellingPrice + lineTax;
          return `
          <tr>
            <td>${item.name}<br /><span class="muted">Batch ${item.batch}</span></td>
            <td>${item.quantity}</td>
            <td>${money(item.sellingPrice)}</td>
            <td>${money(lineTax)}</td>
            <td>${money(lineTotal)}</td>
            <td><button class="danger-button" data-remove-bill-item="${item.id}">Remove</button></td>
          </tr>`;
        })
        .join("")
    : emptyRow(6, "No items added to this bill.");

  const totals = calculateBill();
  elements.billSubtotal.textContent = money(totals.subtotal);
  elements.billTax.textContent = money(totals.tax);
  elements.billDiscountAmount.textContent = money(totals.discount);
  elements.billTotal.textContent = money(totals.total);
  elements.invoiceNumber.textContent = billItems.length ? "Draft invoice" : "Draft";
}

function renderCustomers() {
  const query = elements.customerSearch.value.trim().toLowerCase();
  const customers = state.customers.filter((customer) =>
    [customer.name, customer.phone, customer.reason].join(" ").toLowerCase().includes(query)
  );

  elements.customersTable.innerHTML = customers.length
    ? customers
        .map(
          (customer) => `
        <tr>
          <td>${customer.name}</td>
          <td>${customer.phone}</td>
          <td>${customer.reason || "-"}</td>
          <td>${money(customer.totalCost)}</td>
          <td>
            <div class="row-actions">
              <button class="ghost-button" data-edit-customer="${customer.id}">Edit</button>
              <button class="danger-button" data-delete-customer="${customer.id}">Delete</button>
            </div>
          </td>
        </tr>`
        )
        .join("")
    : emptyRow(5, "No customers found.");
}

function renderSales() {
  const query = elements.salesSearch.value.trim().toLowerCase();
  const sales = state.sales.filter((sale) => [sale.invoiceNo, sale.customerName].join(" ").toLowerCase().includes(query));

  elements.salesTable.innerHTML = sales.length
    ? sales
        .map(
          (sale) => `
        <tr>
          <td>${sale.invoiceNo}</td>
          <td>${formatDate(sale.date)}</td>
          <td>${sale.customerName}</td>
          <td>${sale.items.length}</td>
          <td>${money(sale.total)}</td>
          <td><button class="ghost-button" data-view-sale="${sale.id}">View</button></td>
        </tr>`
        )
        .join("")
    : emptyRow(6, "No sales recorded yet.");
}

function addBotMessage(message, sender = "bot") {
  const bubble = document.createElement("div");
  bubble.className = `bot-message ${sender}`;
  bubble.textContent = message;
  elements.botMessages.appendChild(bubble);
  elements.botMessages.scrollTop = elements.botMessages.scrollHeight;
}

function findMedicineInQuestion(question) {
  const normalized = question.toLowerCase();
  return state.medicines.find((medicine) => {
    const name = medicine.name.toLowerCase();
    const baseName = name.split(" ")[0];
    return normalized.includes(name) || normalized.includes(baseName) || normalized.includes(medicine.batch.toLowerCase());
  });
}

function findKnowledgeInQuestion(question) {
  const normalized = question.toLowerCase();
  return medicineKnowledge.find((entry) => entry.keys.some((key) => normalized.includes(key)));
}

function answerBot(question) {
  const normalized = question.toLowerCase();
  const criticalStock = getCriticalStock();
  const emptyStock = state.medicines.filter((medicine) => medicine.quantity === 0);
  const expiringSoon = state.medicines.filter((medicine) => {
    const days = daysUntil(medicine.expiryDate);
    return days >= 0 && days <= 60;
  });

  if (/(empty|low stock|going empty|reorder|available soon)/.test(normalized)) {
    if (!criticalStock.length) return "No medicine is below its reorder level right now.";
    return criticalStock
      .map((medicine) => `${medicine.name}: ${medicine.quantity} left, reorder level ${medicine.reorderLevel}, batch ${medicine.batch}.`)
      .join("\n");
  }

  if (/(out of stock|zero stock|not available)/.test(normalized)) {
    if (!emptyStock.length) return "No medicine is completely out of stock right now.";
    return emptyStock.map((medicine) => `${medicine.name} is out of stock. Batch ${medicine.batch}.`).join("\n");
  }

  if (/(expiry|expire|expiring)/.test(normalized)) {
    if (!expiringSoon.length) return "No medicine is expiring within the next 60 days.";
    return expiringSoon
      .map((medicine) => `${medicine.name}: expires on ${formatDate(medicine.expiryDate)}, stock ${medicine.quantity}.`)
      .join("\n");
  }

  const inventoryMedicine = findMedicineInQuestion(question);
  if (/(stock|quantity|available|batch|price|mrp)/.test(normalized) && inventoryMedicine) {
    return `${inventoryMedicine.name} is available in quantity ${inventoryMedicine.quantity}. Batch ${inventoryMedicine.batch}, selling price ${money(
      inventoryMedicine.sellingPrice
    )}, expiry ${formatDate(inventoryMedicine.expiryDate)}. ${inventoryMedicine.quantity <= inventoryMedicine.reorderLevel ? "This medicine needs reorder." : "Stock level is okay."}`;
  }

  const knowledge = findKnowledgeInQuestion(question);
  if (knowledge) {
    const matchingInventory = state.medicines.find((medicine) =>
      knowledge.keys.some((key) => medicine.name.toLowerCase().includes(key))
    );
    const stockLine = matchingInventory
      ? `\nStore stock: ${matchingInventory.quantity} units, batch ${matchingInventory.batch}, expiry ${formatDate(matchingInventory.expiryDate)}.`
      : "\nStore stock: This medicine is not currently in your inventory.";
    return `${knowledge.name}: ${knowledge.info}${stockLine}\nSafety note: This bot gives general store-assistant information only, not medical advice.`;
  }

  if (inventoryMedicine) {
    return `${inventoryMedicine.name}: stock ${inventoryMedicine.quantity}, batch ${inventoryMedicine.batch}, category ${inventoryMedicine.category}, supplier ${inventoryMedicine.supplier}, expiry ${formatDate(
      inventoryMedicine.expiryDate
    )}.`;
  }

  return "I could not find that medicine in the inventory or my built-in medicine notes. Add it to Inventory first, or ask about stock, expiry, low stock, paracetamol, amoxicillin, cetirizine, ibuprofen, omeprazole, or ORS.";
}

function handleBotSubmit(event) {
  event.preventDefault();
  const question = elements.botInput.value.trim();
  if (!question) return;
  addBotMessage(question, "user");
  elements.botInput.value = "";
  addBotMessage(answerBot(question), "bot");
}

function clearMedicineForm() {
  elements.medicineForm.reset();
  elements.medicineId.value = "";
  elements.gstRate.value = "12";
}

function clearCustomerForm() {
  elements.customerForm.reset();
  elements.customerId.value = "";
}

function upsertMedicine(event) {
  event.preventDefault();
  const medicine = {
    id: elements.medicineId.value || crypto.randomUUID(),
    name: elements.medicineName.value.trim(),
    category: elements.medicineCategory.value,
    batch: elements.medicineBatch.value.trim(),
    supplier: elements.medicineSupplier.value.trim(),
    purchasePrice: Number(elements.purchasePrice.value),
    sellingPrice: Number(elements.sellingPrice.value),
    quantity: Number(elements.quantity.value),
    reorderLevel: Number(elements.reorderLevel.value),
    expiryDate: elements.expiryDate.value,
    gstRate: Number(elements.gstRate.value),
  };

  const existingIndex = state.medicines.findIndex((item) => item.id === medicine.id);
  if (existingIndex >= 0) {
    state.medicines[existingIndex] = medicine;
    toast("Medicine updated.");
  } else {
    state.medicines.push(medicine);
    toast("Medicine added.");
  }

  saveState();
  clearMedicineForm();
  renderAll();
}

function editMedicine(id) {
  const medicine = state.medicines.find((item) => item.id === id);
  if (!medicine) return;
  elements.medicineId.value = medicine.id;
  elements.medicineName.value = medicine.name;
  elements.medicineCategory.value = medicine.category;
  elements.medicineBatch.value = medicine.batch;
  elements.medicineSupplier.value = medicine.supplier;
  elements.purchasePrice.value = medicine.purchasePrice;
  elements.sellingPrice.value = medicine.sellingPrice;
  elements.quantity.value = medicine.quantity;
  elements.reorderLevel.value = medicine.reorderLevel;
  elements.expiryDate.value = medicine.expiryDate;
  elements.gstRate.value = medicine.gstRate;
  switchView("inventory");
}

function deleteMedicine(id) {
  if (!confirm("Delete this medicine from inventory?")) return;
  state.medicines = state.medicines.filter((medicine) => medicine.id !== id);
  billItems = billItems.filter((item) => item.id !== id);
  saveState();
  renderAll();
  toast("Medicine deleted.");
}

function upsertCustomer(event) {
  event.preventDefault();
  const customer = {
    id: elements.customerId.value || crypto.randomUUID(),
    name: elements.customerName.value.trim(),
    phone: elements.customerPhone.value.trim(),
    reason: elements.customerReason.value.trim(),
    totalCost: Number(elements.customerCost.value || 0),
  };

  const existingIndex = state.customers.findIndex((item) => item.id === customer.id);
  if (existingIndex >= 0) {
    state.customers[existingIndex] = customer;
    toast("Customer updated.");
  } else {
    state.customers.push(customer);
    toast("Customer added.");
  }

  saveState();
  clearCustomerForm();
  renderAll();
}

function editCustomer(id) {
  const customer = state.customers.find((item) => item.id === id);
  if (!customer) return;
  elements.customerId.value = customer.id;
  elements.customerName.value = customer.name;
  elements.customerPhone.value = customer.phone;
  elements.customerReason.value = customer.reason || "";
  elements.customerCost.value = customer.totalCost || 0;
  switchView("customers");
}

function deleteCustomer(id) {
  if (!confirm("Delete this customer?")) return;
  state.customers = state.customers.filter((customer) => customer.id !== id);
  saveState();
  renderAll();
  toast("Customer deleted.");
}

function addToBill() {
  const medicine = state.medicines.find((item) => item.id === elements.billMedicine.value);
  const quantity = Number(elements.billQuantity.value);
  if (!medicine) {
    toast("Select an available medicine.");
    return;
  }

  if (quantity < 1 || quantity > medicine.quantity) {
    toast(`Only ${medicine.quantity} units are available.`);
    return;
  }

  const existing = billItems.find((item) => item.id === medicine.id);
  const existingQuantity = existing ? existing.quantity : 0;
  if (existingQuantity + quantity > medicine.quantity) {
    toast(`Only ${medicine.quantity} units are available.`);
    return;
  }

  if (existing) {
    existing.quantity += quantity;
  } else {
    billItems.push({ ...medicine, quantity });
  }

  elements.billQuantity.value = "1";
  renderBill();
}

function removeBillItem(id) {
  billItems = billItems.filter((item) => item.id !== id);
  renderBill();
}

function completeSale() {
  if (!billItems.length) {
    toast("Add at least one medicine to complete sale.");
    return;
  }

  const customer = state.customers.find((item) => item.id === elements.billCustomer.value);
  const totals = calculateBill();
  const sale = {
    id: crypto.randomUUID(),
    invoiceNo: `INV-${String(state.sales.length + 1).padStart(4, "0")}`,
    date: new Date().toISOString(),
    customerId: customer?.id || "",
    customerName: customer?.name || "Walk-in Customer",
    items: billItems.map((item) => ({
      id: item.id,
      name: item.name,
      batch: item.batch,
      quantity: item.quantity,
      sellingPrice: item.sellingPrice,
      gstRate: item.gstRate,
    })),
    ...totals,
  };

  billItems.forEach((billItem) => {
    const medicine = state.medicines.find((item) => item.id === billItem.id);
    if (medicine) medicine.quantity -= billItem.quantity;
  });

  state.sales.unshift(sale);
  billItems = [];
  saveState();
  renderAll();
  showInvoice(sale);
  toast("Sale completed.");
}

function showInvoice(sale) {
  elements.invoiceContent.innerHTML = `
    <article class="invoice-print">
      <header>
        <div>
          <h2>MediStore</h2>
          <p>Medical Store Invoice</p>
          <p>GSTIN: 29ABCDE1234F1Z5</p>
        </div>
        <div>
          <p><strong>${sale.invoiceNo}</strong></p>
          <p>${formatDate(sale.date)}</p>
          <p>${sale.customerName}</p>
        </div>
      </header>
      <table>
        <thead>
          <tr>
            <th>Medicine</th>
            <th>Batch</th>
            <th>Qty</th>
            <th>Rate</th>
            <th>GST %</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          ${sale.items
            .map((item) => {
              const lineTotal = item.quantity * item.sellingPrice * (1 + item.gstRate / 100);
              return `
                <tr>
                  <td>${item.name}</td>
                  <td>${item.batch}</td>
                  <td>${item.quantity}</td>
                  <td>${money(item.sellingPrice)}</td>
                  <td>${item.gstRate}%</td>
                  <td>${money(lineTotal)}</td>
                </tr>`;
            })
            .join("")}
        </tbody>
      </table>
      <p class="invoice-total">Total: ${money(sale.total)}</p>
    </article>
  `;
  elements.invoiceDialog.showModal();
}

function switchView(viewName) {
  elements.navLinks.forEach((link) => link.classList.toggle("active", link.dataset.view === viewName));
  elements.views.forEach((view) => view.classList.toggle("active", view.id === `${viewName}View`));
  elements.pageTitle.textContent = viewName.charAt(0).toUpperCase() + viewName.slice(1);
}

function seedData() {
  state = structuredClone(sampleData);
  billItems = [];
  saveState();
  renderAll();
  toast("Sample data loaded.");
}

async function enableDesktopNotifications() {
  if (!("Notification" in window)) {
    toast("Desktop notifications are not supported in this browser.");
    return;
  }

  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    toast("Notification permission was not granted.");
    return;
  }

  const criticalStock = getCriticalStock();
  if (!criticalStock.length) {
    new Notification("MediStore stock is healthy", {
      body: "No medicine is going empty right now.",
    });
    return;
  }

  new Notification("MediStore low stock alert", {
    body: criticalStock.slice(0, 5).map((medicine) => `${medicine.name}: ${medicine.quantity} left`).join(", "),
  });
}

function resetData() {
  if (!confirm("Reset all medicines, customers, and sales?")) return;
  state = { medicines: [], customers: [], sales: [] };
  billItems = [];
  saveState();
  renderAll();
  toast("Store data reset.");
}

async function checkAuth() {
  try {
    const response = await fetch("/api/me");
    if (!response.ok) {
      window.location.href = "/login.html";
      return;
    }
    const data = await response.json();
    if (elements.loggedInUser) {
      elements.loggedInUser.textContent = `Signed in as ${data.username}`;
    }
  } catch {
    window.location.href = "/login.html";
  }
}

function logout() {
  fetch("/api/logout", { method: "POST" }).finally(() => {
    window.location.href = "/login.html";
  });
}

document.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;

  const navLink = target.closest(".nav-link");
  if (navLink) switchView(navLink.dataset.view);

  const editMedicineId = target.dataset.editMedicine;
  if (editMedicineId) editMedicine(editMedicineId);

  const deleteMedicineId = target.dataset.deleteMedicine;
  if (deleteMedicineId) deleteMedicine(deleteMedicineId);

  const editCustomerId = target.dataset.editCustomer;
  if (editCustomerId) editCustomer(editCustomerId);

  const deleteCustomerId = target.dataset.deleteCustomer;
  if (deleteCustomerId) deleteCustomer(deleteCustomerId);

  const removeItemId = target.dataset.removeBillItem;
  if (removeItemId) removeBillItem(removeItemId);

  const viewSaleId = target.dataset.viewSale;
  if (viewSaleId) {
    const sale = state.sales.find((item) => item.id === viewSaleId);
    if (sale) showInvoice(sale);
  }

  const botPrompt = target.dataset.botPrompt;
  if (botPrompt) {
    switchView("bot");
    addBotMessage(botPrompt, "user");
    addBotMessage(answerBot(botPrompt), "bot");
  }
});

elements.medicineForm.addEventListener("submit", upsertMedicine);
elements.customerForm.addEventListener("submit", upsertCustomer);
elements.clearMedicineForm.addEventListener("click", clearMedicineForm);
elements.clearCustomerForm.addEventListener("click", clearCustomerForm);
elements.inventorySearch.addEventListener("input", renderInventory);
elements.customerSearch.addEventListener("input", renderCustomers);
elements.salesSearch.addEventListener("input", renderSales);
elements.billDiscount.addEventListener("input", renderBill);
elements.addToBill.addEventListener("click", addToBill);
elements.completeSale.addEventListener("click", completeSale);
elements.printInvoice.addEventListener("click", () => window.print());
elements.closeInvoice.addEventListener("click", () => elements.invoiceDialog.close());
elements.seedDataButton.addEventListener("click", seedData);
elements.resetDataButton.addEventListener("click", resetData);
elements.botForm.addEventListener("submit", handleBotSubmit);
elements.enableNotifications.addEventListener("click", enableDesktopNotifications);
elements.logoutButton.addEventListener("click", logout);

checkAuth();
renderAll();