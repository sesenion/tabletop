type DraggedElement = {
  element: HTMLElement | null;
  internalCursorX: number;
  internalCursorY: number;
};

type SpriteData = {
  id: number;
  name: string;
  xPos: number;
  yPos: number;
};

type RGB = `rgb(${number}, ${number}, ${number})`;
type RGBA = `rgba(${number}, ${number}, ${number}, ${number})`;
type HEX = `#${string}`;

type Color = RGB | RGBA | HEX;

const backendUrl: string = "api";

const sprites: { [id: number]: Sprite } = {};

class Sprite {
  id: number;
  name: string;
  xPos: number;
  yPos: number;
  element: HTMLDivElement;
  backgroundColor: Color;

  constructor(id: number, name: string | null, xPos: number, yPos: number) {
    this.id = id;
    this.name = "";
    if (name !== null) {
      this.name = name;
    }
    this.xPos = xPos;
    this.yPos = yPos;
    this.backgroundColor = "#555555";
    this.element = this._createElement(
      this.id,
      this.name,
      this.backgroundColor
    );
    this._setElementPosition(this.xPos, this.yPos);
  }

  async setPosition(xPos: number, yPos: number) {
    if (xPos === this.xPos && yPos === this.yPos) {
      return;
    }
    this.xPos = xPos;
    this.yPos = yPos;
    const response = await this._postSpritePosition(xPos, yPos);
    this._setElementPosition(xPos, yPos);
  }

  async _postSpritePosition(xPos: number, yPos: number) {
    const spriteUrl = `${backendUrl}/sprites/${this.id}/`;
    const response = await fetch(spriteUrl, {
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
  }

  removeElement() {
    const playing_field = document.querySelector(
      "#playing-field"
    ) as HTMLDivElement;
    const elementId = `sprite-${this.id}`;
    let element = playing_field.querySelector(
      `#${elementId}`
    ) as HTMLDivElement | null;
    if (element === null) {
      return;
    }
    playing_field.removeChild(element);
  }

  _createElement(id: number, name: string, backgroundColor: Color) {
    const playing_field = document.querySelector(
      "#playing-field"
    ) as HTMLDivElement;
    const elementId = `sprite-${id}`;
    let element = playing_field.querySelector(
      `#${elementId}`
    ) as HTMLDivElement | null;
    if (element === null) {
      element = document.createElement("div") as HTMLDivElement;
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

  _setElementPosition(xPos: number, yPos: number) {
    this.element.style.left = `${xPos}px`;
    this.element.style.top = `${yPos}px`;
  }

  draw() {}
}

const dragged: DraggedElement = {
  element: null,
  internalCursorX: 0,
  internalCursorY: 0,
};

async function initialize() {
  const dropElements = document.querySelectorAll("#playing-field");
  dropElements.forEach(() => addEventListener("drop", dropHandler));
  dropElements.forEach(() =>
    addEventListener("dragenter", (event) => event.preventDefault())
  );
  dropElements.forEach((dropElement) =>
    dropElement.addEventListener("dragover", (event) => event.preventDefault())
  );
  const data: SpriteData[] = await readAllSpriteData();
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
}

/**
 * gets the data of all sprites from the backend and sets it with corresponding
 * html elements.
 */
async function readAllSpriteData() {
  const spriteUrl = `${backendUrl}/sprites/`;
  const response = await fetch(spriteUrl, {
    method: "GET",
    mode: "same-origin", // no-cors, *cors, same-origin
    cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
    credentials: "same-origin",
    redirect: "follow", // manual, *follow, error
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
    referrerPolicy: "no-referrer", // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
  });
  return response.json();
}

/**
 * gets the data of all sprites from the backend and sets it with corresponding
 * html elements.
 */
async function readSingleSpriteData(id) {
  const spriteUrl = `${backendUrl}/sprites/${id}`;
  const response = await fetch(spriteUrl, {
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
}

function getCsrfToken(): string {
  const cookieLines = document.cookie.split(";").map((line) => line.trim());
  const cookieMap = {};
  for (const line of cookieLines) {
    const lineArray = line.split("=");
    cookieMap[lineArray[0]] = lineArray[1];
  }
  return cookieMap["csrftoken"];
}

function getOrCreateSprite(
  id: number,
  name: string,
  xPos: number,
  yPos: number
): Sprite {
  let sprite: Sprite;
  if (!(id in sprites)) {
    sprite = new Sprite(id, name, xPos, yPos);
    sprites[id] = sprite;
  } else {
    sprite = sprites[id];
  }
  return sprite;
}

function determineNewPosition(
  dragged: DraggedElement,
  event
): [number, number] {
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
  if (dragged.element === null) return;
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
  dragged.element = event.target as HTMLElement;
  dragged.internalCursorX = event.layerX;
  dragged.internalCursorY = event.layerY;
}

function spriteDragendHandler(event) {
  console.log(event);
}

initialize();
