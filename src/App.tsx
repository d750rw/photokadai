import React, { useCallback, useEffect, useRef, useState } from 'react';
import './App.css';
import LightGallery from 'lightgallery/react';
import lgZoom from 'lightgallery/plugins/zoom';
import lgThumbnail from 'lightgallery/plugins/thumbnail';
// import lgPager from 'lightgallery/plugins/pager';
import lgAutoplay from 'lightgallery/plugins/autoplay';
import lgFullscreen from 'lightgallery/plugins/fullscreen';
import lgHash from 'lightgallery/plugins/hash';

import 'lightgallery/css/lightgallery.css';
import 'lightgallery/css/lg-zoom.css';
import 'lightgallery/css/lg-thumbnail.css';
import 'lightgallery/css/lg-pager.css';
import 'lightgallery/css/lg-autoplay.css';
import 'lightgallery/css/lg-fullscreen.css';
import { GalleryItem } from 'lightgallery/lg-utils';

function App() {
  const [images, setImages] = useState([] as GalleryItem[]);
  const [err, setErr] = useState('');
  const lightGallery = useRef<any>(null);
  const getData = () => {
    setErr('')
    fetch(document?.location?.href?.indexOf('d750rw.github.io/photokadai') > 0 ? './lg/default.json' : './lg/images.json', {
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }
    }
    ).then(function (response) {
      return response.json()
    }).then(function (myJson) {
      setImages(Object.values(myJson.files));
      if (lightGallery) {
        lightGallery.current.refresh();
      }
    }).catch(() => {
      setErr('Unable to load Album details, images.json');
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
    });
  }, [images])
  return (
    <div className="App">
      <div className='gallary-wrap'>
        <LightGallery onInit={(detail) => { if (detail) lightGallery.current = detail.instance }}
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
  );
}

export default App;
