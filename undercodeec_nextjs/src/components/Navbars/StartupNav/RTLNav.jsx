import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import navbarScrollEffect from "@/common/navbarScrollEffect";

const Navbar = ({ whiteNotRounded }) => {
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
    <nav className={`navbar navbar-expand-lg navbar-light style-6 ${whiteNotRounded ? 'bg-white rounded-0 position-relative' : ''}`} ref={navbarRef}>
      <div className="container-fluid">
        <a className="navbar-brand" href="#">
          <img src="/assets/img/logo_home6.png" alt="" />
        </a>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse"
          data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent"
          aria-expanded="false" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarSupportedContent">
          <ul className="navbar-nav m-auto mb-2 mb-lg-0">
            <li className="nav-item dropdown" onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
              <a className="nav-link active dropdown-toggle" href="#" id="navbarDropdown1" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                الرئيسية
              </a>
              <ul className="dropdown-menu" aria-labelledby="navbarDropdown1">
                <li><Link href="/aplicaciones-moviles" className="dropdown-item">صفحة هبوط للتطبيق</Link></li>
                <li><Link href="/home-saas-technology" className="dropdown-item">التكنولوجى</Link></li>
                <li><Link href="/marketing-para-tu-negocio" className="dropdown-item">التسويق الالكترونى</Link></li>
              </ul>
            </li>
            <li className="nav-item dropdown" onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
              <a className="nav-link dropdown-toggle" href="#" id="navbarDropdown2" role="button"
                data-bs-toggle="dropdown" aria-expanded="false">
                الصفحات الداخلية
              </a>
              <ul className="dropdown-menu" aria-labelledby="navbarDropdown1">
                <li><Link href="/rtl-page-about" className="dropdown-item">من نحن</Link></li>
                <li><Link href="/rtl-page-product" className="dropdown-item">المنتجات</Link></li>
                <li><Link href="/rtl-page-services" className="dropdown-item">الخدمات</Link></li>
                <li><Link href="/rtl-page-shop" className="dropdown-item">المتجر</Link></li>
                <li><Link href="/rtl-page-single-project" className="dropdown-item">تفاصيل المشروع</Link></li>
                <li><Link href="/rtl-page-single-post" className="dropdown-item">تفاصيل الخبر</Link></li>
              </ul>
            </li>
            <li className="nav-item">
              <Link href="/rtl-page-portfolio" className="nav-link">
                المشاريع
              </Link>
            </li>
            <li className="nav-item">
              <Link href="/rtl-page-blog" className="nav-link">
                المدونة
              </Link>
            </li>
            <li className="nav-item">
              <Link href="/rtl-page-contact" className="nav-link">
                اتصل بنا
              </Link>
            </li>
          </ul>
          <div className="nav-side">
            <div className="d-flex align-items-center">
              <Link href="/rtl-page-contact" className="btn rounded-pill butn-blue6 hover-blue2 sm-butn fw-bold">
                <span>
                  <i className="bi bi-chat-dots me-2"></i>
                  لنتحدث الأن !
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
