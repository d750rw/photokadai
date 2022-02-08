import React, { useCallback, useEffect, useRef, useState } from 'react'
import './App.css'
import LightGallery from 'lightgallery/react'
import lgZoom from 'lightgallery/plugins/zoom'
import lgThumbnail from 'lightgallery/plugins/thumbnail'
import lgAutoplay from 'lightgallery/plugins/autoplay'
import lgFullscreen from 'lightgallery/plugins/fullscreen'
import lgHash from 'lightgallery/plugins/hash'
import { Helmet } from 'react-helmet'
import packageInfo from '../package.json'
import 'lightgallery/css/lightgallery.css'
import 'lightgallery/css/lg-zoom.css'
import 'lightgallery/css/lg-thumbnail.css'
import 'lightgallery/css/lg-pager.css'
import 'lightgallery/css/lg-autoplay.css'
import 'lightgallery/css/lg-fullscreen.css'
import { GalleryItem } from 'lightgallery/lg-utils'

function App() {
  const [images, setImages] = useState([] as GalleryItem[])
  const [err, setErr] = useState('')
  const lightGallery = useRef<any>(null)
  const meta = {
    title: 'Aarnavi Bday',
    date: '20220205',
    description: 'Photokadai is a photo album of my birthday',
    imgCard: 'https://images.unsplash.com/photo-1630567804048-96a2ea2c2f83?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=250&q=80',
    tUser: '@anandchakru',
    imgMain: 'https://images.unsplash.com/photo-1630567804048-96a2ea2c2f83?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=250&q=80',
    type: 'article',
    homepage: packageInfo.homepage,
  }
  const backButtonFix = () => {
    const href = window.location.href
    if (href) {
      window.history.pushState({}, '', new URL(href.indexOf('/#') > 0 ? href.substring(0, href.indexOf('/#')) : href))
    }
  }
  const getData = () => {
    setErr('')
    fetch(document?.location?.href?.indexOf('d750rw.github.io/photokadai') > 0 || document?.location?.href?.indexOf('localhost:3000/photokadai') > 0 ? './lg/default.json' : './lg/images.json', {
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }
    }
    ).then(function (response) {
      return response.json()
    }).then(function (myJson) {
      setImages(Object.values(myJson.files))
      if (lightGallery) {
        lightGallery.current.refresh()
      }
    }).catch(() => {
      setErr('Unable to load Album details, images.json')
    })
  }
  useEffect(() => { getData() }, [])
  const paintImagees = useCallback(() => {
    return images.map((image) => {
      return <a
        key={image.id}
        data-lg-size={image.size}
        className="gallery-item"
        data-src={image.src}
        href={image.src}
      >
        <img alt={image.id} className="img-responsive" src={image.thumb} />
      </a>
    })
  }, [images])
  return (
    <div className="App">
      <Helmet>‍
        <title>{meta.title}</title>‍
        <meta name="description" content={meta.title} />
        <meta name="twitter:card" content={meta.imgCard} />
        <meta name="twitter:site" content={meta.tUser} />
        <meta name="twitter:creator" content={meta.tUser} />
        <meta name="twitter:title" content={meta.title} />
        <meta name="twitter:description" content={meta.description} />
        <meta name="twitter:image" content={meta.imgMain} />
        <meta property="og:title" content={meta.title} />
        <meta property="og:description" content={meta.description} />
        <meta property="og:image" content={meta.imgMain} />
        <meta property="og:url" content={meta.homepage} />
        <meta property="og:site_name" content={meta.title} />
        <meta property="og:locale" content="en_US" />
        <meta property="og:type" content={meta.type} />
      </Helmet>
      <div className='gallary-wrap'>
        <LightGallery onInit={(detail) => { if (detail) lightGallery.current = detail.instance }}
          onAfterOpen={backButtonFix}
          plugins={[lgZoom, lgAutoplay, lgFullscreen, lgHash, lgThumbnail]} mode="lg-fade"
          preload={2}
          mobileSettings={{ controls: false, showCloseIcon: true, download: false }}
        >
          {paintImagees()}
        </LightGallery>
        <span style={{ display: 'none' }}>learn react</span>
      </div>
      {err && err.length && <h2 className="gallery-error">{err}</h2>}
    </div>
  )
}

export default App
