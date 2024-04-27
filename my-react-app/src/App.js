
import {BrowserRouter,Routes,Route} from 'react-router-dom';
import Login from './Components/Login/Login';
import Dashboard from './Components/Details/Details';
import ShowDetails from './Components/ShowDetails/ShowDetails';

const App = () => {
  return (
    <BrowserRouter>
    <Routes>
      <Route path='/' element={<Login/>}></Route>
      <Route path='/Dashboard' element={<Dashboard/>}></Route>
      <Route path='/Todisplay' element={<ShowDetails/>}></Route>
    </Routes>
    </BrowserRouter>
  );
};

export default App;
