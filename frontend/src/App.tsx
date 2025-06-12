import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

const LandingPage = lazy(() => import('./pages/LandingPage'));

const App = () => {
  return (
    <BrowserRouter>
      <Suspense fallback={<div></div>}>
        <Routes>
          <Route path='/' element={<LandingPage />}></Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;