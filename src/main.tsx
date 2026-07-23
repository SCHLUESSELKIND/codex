import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'

import '@fontsource/archivo-black'
import '@fontsource-variable/inter'
import './styles/tokens.css'
import './styles/base.css'
import './styles/motion.css'

import { Standby } from './scenes/Standby'
import { Camera } from './scenes/Camera'
import { Build } from './scenes/Build'
import { Screen } from './scenes/Screen'
import { Topic } from './scenes/Topic'
import { LowerThirdView } from './scenes/LowerThirdView'
import { Statement } from './scenes/Statement'
import { Break } from './scenes/Break'
import { End } from './scenes/End'
import { Technical } from './scenes/Technical'
import { ControlPanel } from './control/ControlPanel'
import { SafeScene } from './components/SafeScene'
import { Preview } from './scenes/Preview'
import { Banner } from './yt/Banner'
import { Avatar } from './yt/Avatar'
import { Thumbnail } from './yt/Thumbnail'
import { Endscreen } from './yt/Endscreen'
import { Social } from './yt/Social'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HashRouter>
      <SafeScene>
      <Routes>
        <Route path="/" element={<Navigate to="/control" replace />} />
        {/* OBS-Views */}
        <Route path="/standby" element={<Standby />} />
        <Route path="/camera" element={<Camera />} />
        <Route path="/build" element={<Build />} />
        <Route path="/screen" element={<Screen />} />
        <Route path="/topic" element={<Topic />} />
        <Route path="/lower-third" element={<LowerThirdView />} />
        <Route path="/statement" element={<Statement />} />
        <Route path="/break" element={<Break />} />
        <Route path="/end" element={<End />} />
        <Route path="/technical" element={<Technical />} />
        {/* Regie */}
        <Route path="/control" element={<ControlPanel />} />
        {/* Abnahme: Overlay über simuliertem Videobild */}
        <Route path="/preview/:scene" element={<Preview />} />
        {/* YouTube-Export-Vorlagen */}
        <Route path="/yt/banner" element={<Banner />} />
        <Route path="/yt/avatar" element={<Avatar />} />
        <Route path="/yt/thumb/:template" element={<Thumbnail />} />
        <Route path="/yt/endscreen" element={<Endscreen />} />
        <Route path="/social/:format" element={<Social />} />
      </Routes>
      </SafeScene>
    </HashRouter>
  </React.StrictMode>,
)
