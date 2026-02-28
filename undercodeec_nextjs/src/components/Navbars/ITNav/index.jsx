import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import navbarScrollEffect from "@/common/navbarScrollEffect";

const Navbar = () => {
  const navbarRef = useRef(null);

  useEffect(() => {
    navbarScrollEffect(navbarRef.current);
  }, [navbarRef]);

  const handleMouseMove = (event) => {
    const dropDownToggler = event.target.classList.contains('dropdown-toggle') ? event.target : event.target.querySelector('.dropdown-toggle');
    const dropDownMenu = dropDownToggler?.nextElementSibling;

    dropDownToggler?.classList?.add('show');
    dropDownMenu?.classList?.add('show');
  }

  const handleMouseLeave = (event) => {
    const dropdown = event.target.classList.contains('dropdown') ? event.target : event.target.closest('.dropdown');
    const dropDownToggler = dropdown.querySelector('.dropdown-toggle');
    const dropDownMenu = dropdown.querySelector('.dropdown-menu');

    dropDownToggler?.classList?.remove('show');
    dropDownMenu?.classList?.remove('show');
  }

  return (
    <nav className="navbar navbar-expand-lg navbar-dark style-2 position-absolute w-100 p-0" ref={navbarRef}>
      <div className="container">
        <a className="navbar-brand" href="#">
          <img src="/assets/img/logo_ll.png" alt="" />
        </a>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse"
          data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false"
          aria-label="Toggle navigation">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarSupportedContent">
          <ul className="navbar-nav m-auto mb-2 mb-lg-0 text-uppercase">
            <li className="nav-item dropdown" onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
              <a className="nav-link active dropdown-toggle" href="#" id="navbarDropdown1" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                Homes
              </a>
              <ul className="dropdown-menu" aria-labelledby="navbarDropdown1">
                <li><Link href="/" className="dropdown-item">Landing Preview</Link></li>
                <li><Link href="/home-it-solutions2" className="dropdown-item"> Creative It Solutions</Link></li>
                <li><Link href="/software-para-tu-negocio" className="dropdown-item"> Data Analysis</Link></li>
                <li><Link href="/aplicaciones-moviles" className="dropdown-item"> App Landing</Link></li>
                <li><Link href="/home-saas-technology" className="dropdown-item"> Saas Technology</Link></li>
                <li><Link href="/marketing-para-tu-negocio" className="dropdown-item"> Marketing Startup</Link></li>
                <li><Link href="/home-it-solutions" className="dropdown-item"> It Solution</Link></li>
                <li><Link href="/home-software-company" className="dropdown-item"> Software Company</Link></li>
                <li><Link href="/home-digital-agency" className="dropdown-item"> Digital Agency</Link></li>
                <li><Link href="/home-shop-modern" className="dropdown-item"> Modren Shop</Link></li>
              </ul>
            </li>
            <li className="nav-item dropdown" onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
              <a className="nav-link dropdown-toggle" href="#" id="navbarDropdown2" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                pages
              </a>
              <ul className="dropdown-menu" aria-labelledby="navbarDropdown1">
                <li><Link href="/nuestra-trayectoria" className="dropdown-item">about</Link></li>
               
                <li><Link href="/servicios" className="dropdown-item">services</Link></li>
                <li><Link href="/page-shop-5" className="dropdown-item">shop</Link></li>
                <li><Link href="/page-single-project-5" className="dropdown-item">single project</Link></li>
              </ul>
            </li>
            <li className="nav-item">
              <Link href="/page-portfolio-5" className="nav-link">
                portfolio
              </Link>
            </li>
            <li className="nav-item">
              <Link href="/noticias" className="nav-link">
                blog
              </Link>
            </li>
            <li className="nav-item">
              <Link href="/page-contact-5" className="nav-link">
                contact
              </Link>
            </li>
          </ul>
          <div className="nav-side">
            <div className="qoute-nav ps-4">
              <a href="#" className="search-icon me-3">
                <i className="bi bi-search"></i>
              </a>
              <a href="#" className="cart-icon me-3">
                <i className="bi bi-cart"></i>
                <span className="cart-num ms-1">
                  2
                </span>
              </a>
              <Link href="/page-contact-5" className="btn sm-butn border text-white radius-9 hover-darkBlue">
                <span>Free Quote</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
