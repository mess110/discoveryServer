var cm

// https://stackoverflow.com/a/2117523
function guid() {
  if (crypto !== undefined && crypto !== null && typeof(crypto.getRandomValues) === 'function') {
    return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
      (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    )
  } else {
    logger.warn("Using Math.random which is not really random")
    const s4 = () => Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1)
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4()
  }
}

function newRoom() {
  window.location.href = getRoomUrl()
}

function getRoomUrl(id) {
  if (id === null || id === undefined || id === '') {
    id = guid()
  }
  let base = window.location.href.split('#')[0]
  base = base.split('?')[0]
  return base + `?id=${id}`
}

function init() {
  var container = document.getElementById('container')
  var classes = ["one", "two", "three", "four", "five", "six", "seven", "eight"]
  var clients = 1
  var iceServers = [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:global.stun.twilio.com:3478?transport=udp' }
  ]
  var roomId = discoveryClient.getParameterByName('id') || 'conf-default'

  var roomIdLink = document.querySelector('#roomId')
  roomIdLink.textContent = roomId
  roomIdLink.setAttribute('href', getRoomUrl(roomId))

  navigator.mediaDevices.enumerateDevices().then((devices) => {
    let mediaOptions = {
      video: false,
      audio: false
    }
    devices.forEach((device) => {
      if (device.kind === 'videoinput') { mediaOptions.video = true }
      if (device.kind === 'audioinput') { mediaOptions.audio = true }
    })

    initHardware(mediaOptions)
  })

  function initHardware(options) {
    console.log(options)
    navigator.mediaDevices.getUserMedia(options).then((stream) => {
      initRTC(stream)
    }).catch((error) => {
      console.error(error)
      initRTC(false)
    })
  }

  function initRTC(stream) {
    play('own', stream)
    cm = new discoveryClient.Mesh(handlePeer, iceServers)
    cm.connect('/', roomId, stream)
  }

  function getFullId(id) {
    return `video-${id}`
  }

  function findOrCreateVideo(id) {
    container.className = classes[clients-1]

    let v = document.getElementById(getFullId(id))
    if (v === null) {
      let item = document.createElement("div")
      item.className = "item"
      v = document.createElement('video')
      v.setAttribute('id', getFullId(id))
      v.setAttribute('class', 'video-item')
      v.muted = id == 'own'
      item.appendChild(v)
      container.appendChild(item)
      clients++
    }
    return v
  }

  function handlePeer(peer) {
    peer.on('connect', () => {
      console.log('connect')
      findOrCreateVideo(peer._id)
    })
    peer.on('data', (data) => {
      console.log(data)
    })
    peer.on('stream', (stream) => {
      console.log('stream')
      play(peer._id, stream)
    })
    peer.on('error', (error) => {
      console.error(error)
    })
    peer.on('close', () => {
      console.log('close')
      let v = document.getElementById(getFullId(peer._id))
      if (v !== null) {
        container.removeChild(v.parentElement)
        clients--
      }
    })
  }

  function play(id, stream) {
    let video = findOrCreateVideo(id)
    if (stream) {
      video.srcObject = stream
      video.play()
    }
  }
}

document.addEventListener("DOMContentLoaded", init)
