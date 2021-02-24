const carousel = document.querySelector('.carousel');
const slider = document.querySelector('.carousel .slider');
const prev = document.querySelector('.carousel .controls .prev');
const next = document.querySelector('.carousel .controls .next');
const indicatorParents = document.querySelector('.carousel .controls ul');
const totalPanels = document.querySelectorAll('.carousel .slider section').length;

slider.style.width = `${100* totalPanels}%`; //width of the slider is dependant on the amount of panels (<section>s) we have

for(let i = 1; i< totalPanels; i++){
    indicatorParents.innerHTML += `<li></li>`
}

let MultiplePanelsToSkip = null;
let isSwipingEnabled = true;
let isGestureActive = false;
let gestureStartPosition = 0;
let transformVal = 0;
let validSwipe = null;
let currentPanel = 0;
let isTransitionendEventEnabled = true;
let transform = 0;
let deltaX = 0;
let direction = -1;

function disableSwiping() {
    isSwipingEnabled = false;
}

function enableSwiping() {
    isSwipingEnabled = true;
}

function translate(direction, amount = (100/totalPanels), units = '%') {
    slider.style.transform = `translate(${direction * amount}${units})`;
}

function loadContent(value) {
    if (value === 1 && direction === -1) { //if the values dont match, that means there is no content in the direction we want to go. 
        append()
        direction = 1;
        carousel.style.justifyContent = `flex-end`
    } else if (value === -1 && direction === 1) {
        direction = -1;
        prepend()
        carousel.style.justifyContent = `flex-start`;
    }
}

function append(numOfpanelsToAdd = 1) {
    for (let i = 0; i < numOfpanelsToAdd; i++) {
        slider.appendChild(slider.firstElementChild);
    }
}

function prepend(numOfpanelsToAdd = 1) {
    for (let i = 0; i < numOfpanelsToAdd; i++) {
        slider.prepend(slider.lastElementChild)
    }
}

//arrow(prev/next) click events
prev.addEventListener('click', e => {
    disableSwiping();
    loadContent(1);
    translate(1);
})

next.addEventListener('click', e => {
    disableSwiping();
    loadContent(-1);
    translate(-1);
})

// select slide X event
document.querySelectorAll('.controls li').forEach((indicator, index) => {
    indicator.addEventListener('click', e => {
        if (index !== currentPanel) {
            disableSwiping()
            let deltaPanels = (currentPanel - index); //calculate the difference between the current panel, and the panel the user wants to skip to

            loadContent(Math.sign(deltaPanels))
            translate(deltaPanels)

            //todo - what this-------------
            if (deltaPanels > 1 || deltaPanels < -1) {
                MultiplePanelsToSkip = deltaPanels;
            }
        }
    })
})

//touch/pointer/swipe events
if (window.PointerEvent) {
    slider.addEventListener('pointerdown', gestureStart);
    slider.addEventListener('pointermove', gestureMove);
    slider.addEventListener('pointerup', gestureEnd)
} else if (window.TouchEvent) {
    slider.addEventListener('touchdown', gestureStart);
    slider.addEventListener('touchmove', gestureMove);
    slider.addEventListener('touchup', gestureEnd)
}

function gestureStart(e) {
    if (isSwipingEnabled) {
        isGestureActive = true; //can be disabled by pointerup/touchup events
        gestureStartPosition = e.pageX;

        //transform is needed for GestureMove() for the panel swipe-follow animation to work
        transform = window.getComputedStyle(slider).getPropertyValue('transform');
        if (transform !== 'none') {
            transform = transform.split(',')[4].trim();
        } else {
            transform = 0;
        }
    }

}

function gestureMove(e) {
    if (isSwipingEnabled && isGestureActive) {
        deltaX = e.pageX - gestureStartPosition; //calc the difference between the starting position (gestureStartPosition) and current position (e.pageX)

        //depending on the direction of the swipe, load content either in the front or back
        loadContent(Math.sign(deltaX))

        if (deltaX > document.querySelector('section').offsetWidth / 4) { // if deltaX is more than 1/4 of the panel's width, then it is a valid swipe
            validSwipe = 1;
        } else if (deltaX < document.querySelector('section').offsetWidth / -4) {
            validSwipe = -1;
        } else {
            validSwipe = null;
        }

        //animate the panels so it follows the swipe gesture
        transformVal = Number(transform) + deltaX;
        slider.style.transition = `none`;
        translate(1, transformVal, 'px');
    }
}

function gestureEnd(e) {
    if (isSwipingEnabled) {
        isGestureActive = false; //can be enabled by pointerdown/touchdown events
        disableSwiping();
        if (validSwipe) {
            slider.style.transition = `0.3s`;
            translate(validSwipe);
        } else { //small swipe = reset back to current panel (rubber band effect)
            isTransitionendEventEnabled = false;
            slider.style.transition = `all 0.3s`;
            translate(0);
        }
        setTimeout(() => {
            enableSwiping();
        }, 300); //todo set to transitionend block??
    }
}

slider.addEventListener('transitionend', e => {
    if (!isTransitionendEventEnabled) {
        isTransitionendEventEnabled = true;
        return
    }
    if (MultiplePanelsToSkip) {
        if (Math.sign(MultiplePanelsToSkip) === -1) {//forward
            append(MultiplePanelsToSkip * -1);
            currentPanel = currentPanel - MultiplePanelsToSkip;
        } else if (Math.sign(MultiplePanelsToSkip) === 1) {//backward
            prepend(MultiplePanelsToSkip);
            currentPanel = currentPanel - MultiplePanelsToSkip;
        }
    } else {
        if (direction === -1) {
            append();
            if (currentPanel === totalPanels - 1) {
                currentPanel = 0;
            } else {
                currentPanel++;
            }
        } else if (direction === 1) {
            prepend();
            if (currentPanel === 0) {
                currentPanel = totalPanels - 1;
            } else {
                currentPanel--;
            }
        }
    }

    slider.style.transition = `none`;
    translate(0)
    setTimeout(() => {
        slider.style.transition = `all 0.3s`;
    });

    document.querySelector('.controls .selected').classList.remove('selected');
    indicatorParents.children[currentPanel].classList.add('selected');

    if (MultiplePanelsToSkip) {
        MultiplePanelsToSkip = null;
    }
    if (validSwipe) {
        validSwipe = null;
    }
    enableSwiping();
})