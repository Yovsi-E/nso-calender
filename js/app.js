// Nso' Calendar App - 8-day week cycle
// Reference: July 4, 2026 = Rəəvey (first day of 8-day Nso' week - today)

const NSO_WEEKDAYS = [
    'Rəəvey',
    'Kiloòvey',
    'Nsəəri',
    'Geegee',
    'Ngòylúm',
    'Wáylùn',
    'Ntàŋrì',
    'Kaàvi'
];

const NSO_MONTHS = [
    'Mfiilum',
    'Kifir',
    'Kiŋmgbu ke wuu',
    'Vishévti',
    "Ma'an san",
    "Ma'an saar",
    'Ntoòbiŋ',
    'Tònŋkin',
    'Ŋkivin',
    'Verəmrəm',
    'Sán',
    'Ntinen Saar'
];

const GREGORIAN_MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

// Reference date: July 4, 2026 = first day of 8-day Nso' week
const REFERENCE_DATE = new Date(2026, 6, 4); // Month is 0-indexed, so 6 = July

function getNsoWeekdayIndex(date) {
    const diffMs = date.getTime() - REFERENCE_DATE.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    return ((diffDays % 8) + 8) % 8;
}

function getNsoWeekdayName(date) {
    return NSO_WEEKDAYS[getNsoWeekdayIndex(date)];
}

function getNsoMonthName(gregorianMonthIndex) {
    return NSO_MONTHS[gregorianMonthIndex];
}

function isToday(date) {
    const today = new Date();
    return date.getFullYear() === today.getFullYear() &&
           date.getMonth() === today.getMonth() &&
           date.getDate() === today.getDate();
}

// Calendar state
let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();

function getFirstDayOfWeek(date) {
    // Nso' calendar: find the date that falls on the first weekday (Rəəvey)
    // in the current Gregorian week containing the given date
    const dayIndex = getNsoWeekdayIndex(date);
    const diff = dayIndex; // how many days back to reach Rəəvey
    const firstDay = new Date(date);
    firstDay.setDate(date.getDate() - diff);
    return firstDay;
}

function buildCalendar(year, month) {
    const firstOfMonth = new Date(year, month, 1);
    const lastOfMonth = new Date(year, month + 1, 0);

    const startDay = firstOfMonth.getDay(); // 0=Sun
    const daysInMonth = lastOfMonth.getDate();
    const totalCells = Math.ceil((startDay + daysInMonth) / 7) * 7;

    let cells = [];

    for (let i = 0; i < totalCells; i++) {
        const dayOffset = i - startDay;
        const cellDate = new Date(year, month, 1 + dayOffset);

        cells.push({
            date: cellDate.getDate(),
            month: cellDate.getMonth(),
            year: cellDate.getFullYear(),
            nsoDay: getNsoWeekdayName(cellDate),
            isToday: isToday(cellDate),
            isCurrentMonth: cellDate.getMonth() === month,
            fullDate: cellDate
        });
    }

    return cells;
}

const ENGLISH_WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function renderWeekdayHeaders() {
    const container = document.getElementById('weekdayHeaders');
    const today = new Date();
    const todayGregorian = today.getDay();

    container.innerHTML = ENGLISH_WEEKDAYS.map((day, i) => {
        let cls = 'weekday-header';
        if (i === todayGregorian) cls += ' today-col';
        else if (i === 0 || i === 6) cls += ' sunday-col';
        return `<div class="${cls}">${day}</div>`;
    }).join('');
}

function renderCalendar() {
    const grid = document.getElementById('calendarGrid');
    const cells = buildCalendar(currentYear, currentMonth);

    grid.innerHTML = cells.map(cell => {
        if (cell.date === null) {
            return '<div class="day-cell empty"></div>';
        }

        let cls = 'day-cell';
        if (cell.isToday) cls += ' today';
        if (cell.nsoDay === 'Kiloòvey' || cell.nsoDay === 'Ngòylúm') cls += ' country-sunday';
        if (cell.fullDate.getDay() === 0 || cell.fullDate.getDay() === 6) cls += ' weekend';
        if (!cell.isCurrentMonth) cls += ' other-month';

        return `
            <div class="${cls}" data-date="${cell.fullDate.toISOString()}" title="${cell.nsoDay || ''}">
                <span class="gregorian-date">${cell.date}</span>
                <span class="nso-day-label">${cell.nsoDay || ''}</span>
            </div>
        `;
    }).join('');

    // Update month headers
    document.getElementById('nsoMonth').textContent = getNsoMonthName(currentMonth);
    document.getElementById('gregorianMonth').textContent = `${GREGORIAN_MONTHS[currentMonth]} ${currentYear}`;

}

function goToToday() {
    const today = new Date();
    currentMonth = today.getMonth();
    currentYear = today.getFullYear();
    renderAll();
}

function goToPrevMonth() {
    currentMonth--;
    if (currentMonth < 0) {
        currentMonth = 11;
        currentYear--;
    }
    renderAll();
}

function goToNextMonth() {
    currentMonth++;
    if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
    }
    renderAll();
}

function renderTodayView() {
    const today = new Date();
    document.getElementById('todayNsoDay').textContent = getNsoWeekdayName(today);
    document.getElementById('todayGregorianFull').textContent = today.toLocaleDateString('en-US', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
    document.getElementById('todayNsoMonth').textContent = getNsoMonthName(today.getMonth());
    document.getElementById('todayGregShort').textContent = today.toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric'
    });
}

function switchTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));

    document.getElementById('tab-' + tabName).classList.add('active');
    document.querySelector(`.tab-btn[data-tab="${tabName}"]`).classList.add('active');

    if (tabName === 'month') {
        renderWeekdayHeaders();
        renderCalendar();
    }
    if (tabName === 'today') {
        renderTodayView();
    }
}

function renderAll() {
    renderWeekdayHeaders();
    renderCalendar();
    renderTodayView();
}

// Swipe gesture support (only in month tab)
let touchStartX = 0;
let touchStartY = 0;

document.addEventListener('DOMContentLoaded', () => {
    renderAll();

    // Tab switching
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => switchTab(btn.dataset.tab));
    });

    // Month navigation
    document.getElementById('prevMonth').addEventListener('click', goToPrevMonth);
    document.getElementById('nextMonth').addEventListener('click', goToNextMonth);
    document.getElementById('todayBtn').addEventListener('click', () => {
        goToToday();
        switchTab('month');
    });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') goToPrevMonth();
        if (e.key === 'ArrowRight') goToNextMonth();
    });

    // Touch swipe
    const app = document.querySelector('.app-container');
    app.addEventListener('touchstart', (e) => {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
    }, { passive: true });

    app.addEventListener('touchend', (e) => {
        const diffX = e.changedTouches[0].clientX - touchStartX;
        const diffY = e.changedTouches[0].clientY - touchStartY;

        if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
            if (diffX > 0) {
                goToPrevMonth();
            } else {
                goToNextMonth();
            }
        }
    }, { passive: true });

    // Day cell click
    document.getElementById('calendarGrid').addEventListener('click', (e) => {
        const cell = e.target.closest('.day-cell');
        if (!cell || cell.classList.contains('empty')) return;

        cell.style.transform = 'scale(0.9)';
        setTimeout(() => { cell.style.transform = ''; }, 150);
    });
});
