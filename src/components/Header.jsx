import Nav from "./Nav";
import icon from '../assets/icon.png';


export default function Header() {
  return (
    <header>
      <div id="icon" className="brand">
        <img src={icon} alt="Icon" />
        <span>MovieLookup</span>
      </div>
      <Nav />
    </header>
  );
}
