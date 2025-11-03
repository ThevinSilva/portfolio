import MenuButton from "./components/MenuButton";

export default function Header() {
    return (
        <menu>
            <div className="links">
                <MenuButton text={"About"} className={".about"} />
                <MenuButton text={"Work"} className={".work"} />
                <MenuButton text={"Contact"} className={".contact"} />
            </div>
        </menu>
    );
}
