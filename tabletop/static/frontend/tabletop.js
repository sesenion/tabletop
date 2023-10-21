var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const backendUrl = "api";
const sprites = {};
class Sprite {
    constructor(id, name, xPos, yPos) {
        this.id = id;
        this.name = "";
        if (name !== null) {
            this.name = name;
        }
        this.xPos = xPos;
        this.yPos = yPos;
        this.backgroundColor = "#555555";
        this.element = this._createElement(this.id, this.name, this.backgroundColor);
        this._setElementPosition(this.xPos, this.yPos);
    }
    setPosition(xPos, yPos) {
        return __awaiter(this, void 0, void 0, function* () {
            if (xPos === this.xPos && yPos === this.yPos) {
                return;
            }
            this.xPos = xPos;
            this.yPos = yPos;
            const response = yield this._postSpritePosition(xPos, yPos);
            this._setElementPosition(xPos, yPos);
        });
    }
    _postSpritePosition(xPos, yPos) {
        return __awaiter(this, void 0, void 0, function* () {
            const spriteUrl = `${backendUrl}/sprites/${this.id}/`;
            const response = yield fetch(spriteUrl, {
                method: "PATCH",
                mode: "cors",
                cache: "no-cache",
                credentials: "same-origin",
                redirect: "follow",
                headers: {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*",
                    "X-CSRFToken": getCsrfToken(),
                },
                referrerPolicy: "no-referrer",
                body: JSON.stringify({
                    xPos: xPos,
                    yPos: yPos,
                }),
            });
            return response.json();
        });
    }
    removeElement() {
        const playing_field = document.querySelector("#playing-field");
        const elementId = `sprite-${this.id}`;
        let element = playing_field.querySelector(`#${elementId}`);
        if (element === null) {
            return;
        }
        playing_field.removeChild(element);
    }
    _createElement(id, name, backgroundColor) {
        const playing_field = document.querySelector("#playing-field");
        const elementId = `sprite-${id}`;
        let element = playing_field.querySelector(`#${elementId}`);
        if (element === null) {
            element = document.createElement("div");
            playing_field.appendChild(element);
        }
        element.className = "sprite";
        element.id = elementId;
        element.textContent = name;
        element.draggable = true;
        element.style.backgroundColor = backgroundColor;
        element.addEventListener("dragstart", spriteDragstartHandler);
        return element;
    }
    _setElementPosition(xPos, yPos) {
        this.element.style.left = `${xPos}px`;
        this.element.style.top = `${yPos}px`;
    }
    draw() { }
}
const dragged = {
    element: null,
    internalCursorX: 0,
    internalCursorY: 0,
};
function initialize() {
    return __awaiter(this, void 0, void 0, function* () {
        const dropElements = document.querySelectorAll("#playing-field");
        dropElements.forEach(() => addEventListener("drop", dropHandler));
        dropElements.forEach(() => addEventListener("dragenter", (event) => event.preventDefault()));
        dropElements.forEach((dropElement) => dropElement.addEventListener("dragover", (event) => event.preventDefault()));
        const data = yield readAllSpriteData();
        for (const dataSet of data) {
            getOrCreateSprite(dataSet.id, dataSet.name, dataSet.xPos, dataSet.yPos);
        }
        const dataIds = data.map((dataSet) => String(dataSet.id));
        const spriteIds = Object.keys(sprites);
        for (const spriteId in spriteIds) {
            if (!(spriteId in dataIds)) {
                const sprite = sprites[spriteId];
                sprite.removeElement();
                delete sprites[spriteId];
            }
        }
    });
}
/**
 * gets the data of all sprites from the backend and sets it with corresponding
 * html elements.
 */
function readAllSpriteData() {
    return __awaiter(this, void 0, void 0, function* () {
        const spriteUrl = `${backendUrl}/sprites/`;
        const response = yield fetch(spriteUrl, {
            method: "GET",
            mode: "same-origin",
            cache: "no-cache",
            credentials: "same-origin",
            redirect: "follow",
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
            },
            referrerPolicy: "no-referrer", // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
        });
        return response.json();
    });
}
/**
 * gets the data of all sprites from the backend and sets it with corresponding
 * html elements.
 */
function readSingleSpriteData(id) {
    return __awaiter(this, void 0, void 0, function* () {
        const spriteUrl = `${backendUrl}/sprites/${id}`;
        const response = yield fetch(spriteUrl, {
            method: "GET",
            mode: "same-origin",
            cache: "no-cache",
            credentials: "same-origin",
            redirect: "follow",
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
            },
            referrerPolicy: "no-referrer",
        });
        return response.json();
    });
}
function getCsrfToken() {
    const cookieLines = document.cookie.split(";").map((line) => line.trim());
    const cookieMap = {};
    for (const line of cookieLines) {
        const lineArray = line.split("=");
        cookieMap[lineArray[0]] = lineArray[1];
    }
    return cookieMap["csrftoken"];
}
function getOrCreateSprite(id, name, xPos, yPos) {
    let sprite;
    if (!(id in sprites)) {
        sprite = new Sprite(id, name, xPos, yPos);
        sprites[id] = sprite;
    }
    else {
        sprite = sprites[id];
    }
    return sprite;
}
function determineNewPosition(dragged, event) {
    if (dragged.element === null) {
        return [0, 0];
    }
    // get mouse cursor position inside the drop target element.
    // Assume drop target is #playing-field and correct later if that
    // assumption is false.
    let dropXRelativeToPlayingField = event.layerX;
    let dropYRelativeToPlayingField = event.layerY;
    if (event.target.classList.contains("sprite")) {
        // drop happened on another sprite instead of the playing field,
        // but we need it relative to the playing field. So add offset of
        // the drop target sprite, since that is relative to the playing
        // field.
        dropXRelativeToPlayingField += event.target.offsetLeft;
        dropYRelativeToPlayingField += event.target.offsetTop;
    }
    // top left position of the dragged sprite needs to be corrected
    // for where inside the sprite the drag cursor was when drag started
    let newX = dropXRelativeToPlayingField - dragged.internalCursorX;
    let newY = dropYRelativeToPlayingField - dragged.internalCursorY;
    return [newX, newY];
}
function dropHandler(event) {
    console.log(dragged.element);
    console.log(event);
    if (dragged.element === null)
        return;
    const [newX, newY] = determineNewPosition(dragged, event);
    const idMatch = /sprite-(\d+)/.exec(dragged.element.id);
    if (!idMatch) {
        return;
    }
    const id = parseInt(idMatch[1]);
    sprites[id].setPosition(newX, newY);
    dragged.element = null;
    readAllSpriteData();
}
function spriteDragstartHandler(event) {
    console.log(event);
    dragged.element = event.target;
    dragged.internalCursorX = event.layerX;
    dragged.internalCursorY = event.layerY;
}
function spriteDragendHandler(event) {
    console.log(event);
}
initialize();
