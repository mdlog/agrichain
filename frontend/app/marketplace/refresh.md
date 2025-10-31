# Marketplace Refresh Issue Fix

## Problem
Loan yang baru dibuat tidak muncul di marketplace karena:
1. Marketplace hanya query blockchain saat page load
2. Event listener tidak triggered setelah create loan
3. Blockchain query tidak refresh otomatis

## Solution
- Add event listener untuk trigger refresh
- Add focus event listener untuk refresh saat user kembali ke tab
- Improve blockchain query with recent block range
- Add provider dependency to useEffect

