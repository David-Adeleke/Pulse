import { Link } from '@tanstack/react-router';
import "../styles/dashboard.css"

export default function Logo() {
    return (
        <div className="logo-navbar">
            <div className="logo">
                <Link to='/'>
                    <h1>PULSE.NG</h1>
                </Link>
            </div>

            <div className="navbar-container">
                <ul className="navbar">
                    <Link to='/dashboard'>
                        <li>Home</li>
                    </Link>
                    <Link to='/portfolios'>
                        <li>Portfolios</li>
                    </Link>
                    <Link to='/trends'>
                        <li>Market Trends</li>
                    </Link>
                    <Link to='/watchlist'>
                        <li>Watchlist</li>
                    </Link>
                </ul>
            </div>
        </div>
    )
}