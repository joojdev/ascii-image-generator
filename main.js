const imageInput = document.querySelector('#imageInput')
const preview = document.querySelector('#preview')
const form = document.querySelector('#form')
const characterWidthInput = document.querySelector('#characterWidth')
const fontSizeInput = document.querySelector('#fontSize')
const screen = document.querySelector('#screen')
const board = document.querySelector('#board')
const context = screen.getContext('2d')
const font = new FontFace('Monofonto', 'url(\'./Monofonto.otf\')')

font.load().then((_) => {
  document.fonts.add(_)
})


function getNewHeight(width, height, newWidth) {
  const newHeight = Math.round((height * newWidth) / width)

  return newHeight
}

function grayscaleToCharacter(pixelStrength, gradient) {
  const index = Math.ceil((pixelStrength * (gradient.length - 1)) / 255)

  return gradient[index]
}

let imageDataURL
let pixelRowArray = []
let characterRowArray = []
let characterGradient = ' .\'`^",:;Il!i><~+_-?][}{1)(|/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$'

form.onsubmit = (event) => {
  event.preventDefault()

  if (!imageDataURL) return

  pixelRowArray = []
  characterRowArray = []
  const image = new Image()
  image.src = imageDataURL

  const newWidth = characterWidthInput.value
  const newHeight = getNewHeight(image.width, image.height, newWidth)

  screen.width = newWidth
  screen.height = newHeight

  context.drawImage(image, 0, 0, newWidth, newHeight)

  for (let i = 0; i < newHeight; i++) {
    let pixelRow = []
    for (let j = 0; j < newWidth; j++) {
      const [red, green, blue, alpha] = context.getImageData(j, i, 1, 1).data
      pixelRow.push({ red, green, blue, alpha })
    }
    pixelRowArray.push(pixelRow)
  }
  
  characterRowArray = pixelRowArray.map((pixelRow) => {
    return pixelRow.map(({ red, green, blue }) => {
      const pixelStrength = (red * 0.299) + (green * 0.587) + (blue * 0.114)
      const character = grayscaleToCharacter(pixelStrength, characterGradient)

      return character
    })
  })
  
  context.clearRect(0, 0, newWidth, newHeight)
  board.innerHTML = ''
  screen.height = 0
  const outputType = document.querySelector('input[name="output"]:checked').id

  if (outputType == 'image') {
    const fontSize = fontSizeInput.value
  
    const resultWidth = newWidth * fontSize
    const resultHeight = newHeight * fontSize
  
    screen.width = resultWidth
    screen.height = resultHeight
  
    context.fillStyle = '#333'
    context.fillRect(0, 0, resultWidth, resultHeight)
  
    context.font = `${fontSize}px Monofonto`
    context.textAlign = 'start'
    context.textBaseline = 'top'
  
    for (let y = 0; y < newHeight; y++) {
      for (let x = 0; x < newWidth; x++) {
        const { red, green, blue, alpha } = pixelRowArray[y][x]
  
        context.fillStyle = `rgba(${red}, ${green}, ${blue}, ${alpha})`
        context.fillText(characterRowArray[y][x], x * fontSize, y * fontSize)
      }
    }
  } else if (outputType == 'text') {
    for (let y = 0; y < newHeight; y++) {
      const rowElement = generateElement('div')
      for (let x = 0; x < newWidth; x++) {
        const { red, green, blue, alpha } = pixelRowArray[y][x]
        const color = `rgba(${red}, ${green}, ${blue}, ${alpha})`
        const text = characterRowArray[y][x] == ' ' ? '&nbsp;' : characterRowArray[y][x]

        const characterElement = generateElement('span', text, color, 'mono')

        rowElement.append(characterElement)
      }
      board.append(rowElement)
    }
  }
}

function generateElement(tag, textContent, color, className) {
  const element = document.createElement(tag)

  if (textContent) {
    element.innerHTML = textContent
  }

  if (color) {
    element.style.color = color
  }

  if (className) {
    element.className = className
  }

  return element
}

imageInput.onchange = ({ target }) => {
  if (target.files && target.files[0]) {
    const reader = new FileReader()
    reader.onload = (event) => {
      imageDataURL = event.target.result
      preview.src = event.target.result
    }

    reader.readAsDataURL(target.files[0])
  }
}