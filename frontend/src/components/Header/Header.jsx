import React, { useState } from "react";
import { Link, NavLink } from 'react-router-dom';
import { Menu, X } from "lucide-react";

export default function Header() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const toggleMobileMenu = () => {
        setMobileMenuOpen(!mobileMenuOpen);
    };

    return (
        <header className="sticky z-50 top-0 bg-white shadow-md">
            <nav className="max-w-6xl mx-auto px-6 py-4">
                <div className="flex flex-wrap justify-between items-center">
                    <Link to="/" className="flex items-center">
                    <span className="text-3xl font-bold">
                                <span className="text-indigo-700">Stack</span>
                                <span className="text-gray-800">IT</span>
                            </span>
                    </Link>
                    
                    {/* Desktop Navigation */}
                    <div className="hidden lg:flex items-center space-x-8">
                        <NavLink
                            to='/'
                            className={({ isActive }) =>
                                `font-medium transition-colors duration-200 ${isActive ? "text-indigo-700" : "text-gray-600"} hover:text-indigo-600`
                            }
                        >
                            Home
                        </NavLink>
                        <NavLink
                            to='/contact-us'
                            className={({ isActive }) =>
                                `font-medium transition-colors duration-200 ${isActive ? "text-indigo-700" : "text-gray-600"} hover:text-indigo-600`
                            }
                        >
                            Contact Us
                        </NavLink>
                    </div>
                    
                    {/* Desktop Buttons */}
                    <div className="hidden lg:flex items-center space-x-4">
                        <Link
                            to="/login"
                            className="text-indigo-700 hover:text-indigo-800 border border-indigo-200 hover:bg-gray-50 px-4 py-2 rounded-md font-medium transition-colors duration-200"
                        >
                            Log in
                        </Link>
                        <Link
                            to="/register"
                            className="bg-indigo-700 hover:bg-indigo-800 text-white px-4 py-2 rounded-md font-medium transition-colors duration-200"
                        >
                            Get Started
                        </Link>
                    </div>

                    {/* Mobile Menu Button */}
                    <button 
                        onClick={toggleMobileMenu}
                        className="lg:hidden bg-indigo-50 hover:bg-indigo-100 p-2 rounded-md transition-colors duration-200"
                        aria-label="Toggle mobile menu"
                    >
                        {mobileMenuOpen ? (
                            <X size={24} className="text-indigo-700" />
                        ) : (
                            <Menu size={24} className="text-indigo-700" />
                        )}
                    </button>
                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div className="lg:hidden py-4 mt-4 border-t border-gray-100">
                        <div className="flex flex-col space-y-4">
                            <NavLink
                                to='/'
                                className={({ isActive }) =>
                                    `font-medium transition-colors duration-200 py-2 ${isActive ? "text-indigo-700" : "text-gray-600"} hover:text-indigo-600`
                                }
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Home
                            </NavLink>
                            <NavLink
                                to='/contact-us'
                                className={({ isActive }) =>
                                    `font-medium transition-colors duration-200 py-2 ${isActive ? "text-indigo-700" : "text-gray-600"} hover:text-indigo-600`
                                }
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Contact Us
                            </NavLink>
                            
                            <div className="flex flex-col space-y-3 pt-4">
                                <Link
                                    to="/login"
                                    className="text-indigo-700 hover:text-indigo-800 border border-indigo-200 hover:bg-gray-50 px-4 py-2 rounded-md font-medium transition-colors duration-200 text-center"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    Log in
                                </Link>
                                <Link
                                    to="/register"
                                    className="bg-indigo-700 hover:bg-indigo-800 text-white px-4 py-2 rounded-md font-medium transition-colors duration-200 text-center"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    Get Started
                                </Link>
                            </div>
                        </div>
                    </div>
                )}
            </nav>
        </header>
    );
}