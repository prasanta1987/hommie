
const Footer = () => {
    return (
        <footer className="bg-dark text-light p-2 text-center sticky-bottom">
        <div className="container">
            <span>&copy; {new Date().getFullYear()}</span>
        </div>
        </footer>
    );
    }
    
export default Footer;
