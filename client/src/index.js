import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import FavouriteList from './FavouriteList';
import VideosList from './VideosList';

import App from './App';

ReactDOM.render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<FavouriteList />} />
      <Route path="/:id/videos" element={<VideosList />} />
    </Routes>
  </BrowserRouter>,
  document.getElementById('root')
);