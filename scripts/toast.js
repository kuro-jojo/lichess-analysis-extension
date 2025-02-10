
const style = document.createElement('style');
style.innerHTML = `
.toast {
    visibility: hidden;
    max-width: 50%;
    margin: 0 auto;
    background-color:rgb(85, 85, 85);
    color:rgb(195, 221, 195);
    text-align: center; 
    border-radius: 2px;
    padding: 16px;
    position: fixed;
    z-index: 1000;
    left: 50%;
    bottom: 30px;
    font-size: 20px;
    transform: translateX(-50%);
}

.toast.show {
    visibility: visible;
    -webkit-animation: fadein 0.5s, fadeout 0.5s 1.5s;
    animation: fadein 0.5s, fadeout 0.5s 1.5s;
}

@-webkit-keyframes fadein {
    from {bottom: 0; opacity: 0;} 
    to {bottom: 30px; opacity: 1;}
}

@keyframes fadein {
    from {bottom: 0; opacity: 0;}
    to {bottom: 30px; opacity: 1;}
}

@-webkit-keyframes fadeout {
    from {bottom: 30px; opacity: 1;} 
    to {bottom: 0; opacity: 0;}
}

@keyframes fadeout {
    from {bottom: 30px; opacity: 1;}
    to {bottom: 0; opacity: 0;}
}
`;
document.head.appendChild(style);

// Function to show toast
const showToast = (message) => {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerText = message;
    document.body.appendChild(toast);
    toast.classList.add('show');

    toast.addEventListener('animationend', (event) => {
        if (event.animationName === 'fadeout') {
            toast.classList.remove('show');
            document.body.removeChild(toast);
        }
    });
}