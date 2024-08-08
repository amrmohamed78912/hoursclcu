document.addEventListener('DOMContentLoaded', function() {
    const tableBody = document.querySelector('#workHoursTable tbody');

    // إنشاء جدول يحتوي على 31 صفًا
    for (let i = 1; i <= 31; i++) {
        const row = document.createElement('tr');

        const dayCell = document.createElement('td');
        dayCell.textContent = `اليوم ${i}`;
        row.appendChild(dayCell);

        const checkInCell = document.createElement('td');
        const checkInInput = document.createElement('input');
        checkInInput.type = 'time';
        checkInCell.appendChild(checkInInput);
        row.appendChild(checkInCell);

        const checkOutCell = document.createElement('td');
        const checkOutInput = document.createElement('input');
        checkOutInput.type = 'time';
        checkOutCell.appendChild(checkOutInput);
        row.appendChild(checkOutCell);

        const hoursCell = document.createElement('td');
        hoursCell.textContent = '0:00';
        row.appendChild(hoursCell);

        // تحديث عدد الساعات بشكل تلقائي
        checkInInput.addEventListener('change', () => calculateDailyHours(checkInInput, checkOutInput, hoursCell));
        checkOutInput.addEventListener('change', () => calculateDailyHours(checkInInput, checkOutInput, hoursCell));

        tableBody.appendChild(row);
    }

    loadSavedData();
});

function calculateDailyHours(checkInInput, checkOutInput, hoursCell) {
    const checkInTime = checkInInput.value;
    const checkOutTime = checkOutInput.value;

    if (checkInTime && checkOutTime) {
        const [checkInHours, checkInMinutes] = checkInTime.split(':').map(Number);
        const [checkOutHours, checkOutMinutes] = checkOutTime.split(':').map(Number);

        let totalMinutes = (checkOutHours * 60 + checkOutMinutes) - (checkInHours * 60 + checkInMinutes);

        if (totalMinutes < 0) {
            totalMinutes += 24 * 60; // للتعامل مع الحضور والانصراف في يومين مختلفين
        }

        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;

        hoursCell.textContent = `${hours}:${minutes < 10 ? '0' : ''}${minutes}`;

        saveData();
    }
}

function calculateTotalHours() {
    const hoursCells = document.querySelectorAll('#workHoursTable tbody td:nth-child(4)');
    let totalMinutes = 0;

    hoursCells.forEach(cell => {
        const [hours, minutes] = cell.textContent.split(':').map(Number);
        totalMinutes += (hours * 60) + minutes;
    });

    const totalHours = Math.floor(totalMinutes / 60);
    const totalMinutesLeft = totalMinutes % 60;

    document.getElementById('totalHours').textContent = `مجموع الساعات: ${totalHours}:${totalMinutesLeft < 10 ? '0' : ''}${totalMinutesLeft}`;
}

function resetApplication() {
    if (confirm('هل أنت متأكد أنك تريد إعادة التشغيل؟ سيتم حذف جميع البيانات.')) {
        localStorage.removeItem('workHoursData'); // حذف البيانات من localStorage
        location.reload(); // إعادة تحميل الصفحة
    }
}

function saveData() {
    const data = [];
    const rows = document.querySelectorAll('#workHoursTable tbody tr');
    rows.forEach(row => {
        const checkIn = row.children[1].querySelector('input').value;
        const checkOut = row.children[2].querySelector('input').value;
        const hours = row.children[3].textContent;
        data.push({ checkIn, checkOut, hours });
    });
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 31); // تحديد تاريخ انتهاء بعد 31 يوم
    localStorage.setItem('workHoursData', JSON.stringify({ data, expiryDate }));
}

function loadSavedData() {
    const savedData = JSON.parse(localStorage.getItem('workHoursData'));
    if (savedData) {
        const currentDate = new Date();
        const expiryDate = new Date(savedData.expiryDate);

        // التحقق إذا كانت البيانات قديمة وتحتاج إلى مسحها
        if (currentDate > expiryDate) {
            localStorage.clear();
        } else {
            const rows = document.querySelectorAll('#workHoursTable tbody tr');
            rows.forEach((row, index) => {
                row.children[1].querySelector('input').value = savedData.data[index].checkIn;
                row.children[2].querySelector('input').value = savedData.data[index].checkOut;
                row.children[3].textContent = savedData.data[index].hours;
            });
        }
    }
}

// حفظ البيانات تلقائيًا عند الخروج من الصفحة أو تحديثها
window.addEventListener('beforeunload', saveData);
