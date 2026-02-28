/* global fbq */
import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import plans from '@/data/Saas/plans.json';
import plansRTL from '@/data/Saas/plans-rtl.json';
import ReactGA from 'react-ga4';


const Pricing = ({ rtl }) => {
  const data = useMemo(() => rtl ? plansRTL : plans, [rtl]);
  const [features, setFeatures] = useState([]);
  const [loadingIndex, setLoadingIndex] = useState(null);

  useEffect(() => {
    let formattedFeatures = [];

    data[0].features.forEach(feature =>
      formattedFeatures.push({ title: feature.title, data: [] })
    );

    data.forEach((plan, i) => {
      plan.features.forEach((feature, x) => {
        formattedFeatures[x].data[i] =
          feature.checked !== undefined ? feature.checked : feature.content;
      });
    });

    setFeatures(formattedFeatures);
  }, [data]);

  const handlePay = async (plan, index) => {

    // Google Analytics: Evento de clic en el botón de pago
    ReactGA.event({
      category: 'Botón de Pago',
      action: 'Clic en "Lo quiero"',
      label: `${plan.title} - ${plan.price.monthly}`
    });
  
    // Meta Pixel: Evento de clic en el botón de pago
    if (typeof window.fbq === 'function') {
      fbq('track', 'Purchase', {
        content_name: plan.title,
        content_category: 'Plan',
        value: parseFloat(plan.price.monthly.replace('$', '').replace(',', '')),
        currency: 'USD', // O ajusta la moneda según tu caso
      });
    }
  
    setLoadingIndex(index);
    const amount = parseFloat(plan.price.monthly.replace('$', '').replace(',', ''));
  
    try {
      const response = await fetch('https://api.undercodeec.com/api/create-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, planName: plan.title }),
      });
  
      const data = await response.json();
  
      if (response.ok && data.paymentUrl) {
        window.open(data.paymentUrl, '_blank');
      } else {
        console.error('Respuesta inesperada del servidor:', data);
        alert(data.error || 'No se pudo generar el link de pago');
      }
    } catch (err) {
      console.error('Error generando link de pago:', err);
      alert('Error al procesar el pago');
    } finally {
      setLoadingIndex(null);
    }
  };
  
  

  const togglePlanDuration = (duration) => {
    let monthly = document.querySelectorAll('.monthly_price');
    let yearly = document.querySelectorAll('.yearly_price');

    if (duration === 'monthly') {
      monthly.forEach(price => price.classList.add('d-block'));
      monthly.forEach(price => price.classList.remove('d-none'));
      yearly.forEach(price => price.classList.add('d-none'));
      yearly.forEach(price => price.classList.remove('d-block'));
    } else {
      monthly.forEach(price => price.classList.add('d-none'));
      monthly.forEach(price => price.classList.remove('d-block'));
      yearly.forEach(price => price.classList.add('d-block'))
      yearly.forEach(price => price.classList.remove('d-none'));
    }
  }

  return (
    <section className="pricing section-padding style-5" data-scroll-index="4">
      <div className="container">
        <div className="section-head text-center mb-60 style-5">
          <h2 className="mb-20">
            {rtl ? 'اختر السعر' : 'Elige el plan y'} <span>{rtl ? 'واضغط بدأ' : 'Nos pondremos en marcha'}</span>
          </h2>
        </div>
        <div className="pricing-tabsHead text-center"></div>
        <div className="table-responsive">
          <div className="content">
            <div className="price-head">
              <div className="price-headTitle">
                <img src="/assets/img/icons/price_s5.png" alt="" />
              </div>
              {
                data.map((plan, i) => (
                  <div className={`price-headItem ${plan.bestChoice && 'bg-gray5'}`} key={i}>
                    <h6>{plan.title}</h6>
                    <h2 className={`monthly_price ${plan.bestChoice && 'color-blue5'}`}>{plan.price.monthly} <span>/{rtl ? 'شهريا' : 'mo'}</span></h2>
                    <h2 className={`yearly_price ${plan.bestChoice && 'color-blue5'}`}>{plan.price.yearly} <span>/{rtl ? 'سنويا' : 'Mes'}</span></h2>
                    <small>{plan.short_description}</small>
                    <small>{plan.description}</small>
                    {
                      plan.bestChoice && <div className="label">{rtl ? 'أفضل خيار' : 'Recomendable'}</div>
                    }
                  </div>
                ))
              }
            </div>

            <div className="price-body">
              {
                features.map((feature, i) => (
                  <div className="price-bodyItems" key={i}>
                    <div className="price-bodyTitle">
                      {feature.title}
                    </div>
                    {feature.data.map((value, index) => (
                      <div className={`price-item ${index === 1 ? 'bg-gray5' : ''}`} key={index}>
                        {typeof value === 'boolean' ? (value && <i className="bi bi-check2"></i>) : (<span>{value}</span>)}
                      </div>
                    ))}
                  </div>
                ))
              }
            </div>

            <div className="price-foot">
              <div className="price-footTitle"></div>
              {data.map((plan, i) => (
                <div className={`price-footItem ${i === 1 ? 'bg-gray5' : ''}`} key={i}>
                  <button
                    className="btn rounded-pill blue5-3Dbutn hover-blue2 sm-butn fw-bold"
                    onClick={() => handlePay(plan, i)}
                    disabled={loadingIndex === i}
                  >
                    <span>{loadingIndex === i ? (rtl ? '...جار المعالجة' : 'Procesando...') : (rtl ? 'نبدأ الآن ' : 'Lo quiero')}</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
