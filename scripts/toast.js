// Function to show toast
const showToast = (message, error = false) => {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerText = message;
    document.body.appendChild(toast);
    toast.classList.add('show');
    if (error) {
        toast.classList.add('error');
    }

    toast.addEventListener('animationend', (event) => {
        if (event.animationName === 'fadeout') {
            toast.classList.remove('show');
            document.body.removeChild(toast);
        }
    });
}