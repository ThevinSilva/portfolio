import MenuButton from "./components/MenuButton";

export default function Header() {
    return (
        <menu>
            <h1></h1>
            <div className="links">
                <MenuButton text={"About"} />
                <MenuButton text={"Work"} />
                <MenuButton text={"Contact"} />
            </div>
        </menu>
    );
}
