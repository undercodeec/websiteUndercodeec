import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import demos from '@/data/Preview/demos.json';
import TradingCard from './TradingCard';
const Demos = () => {
  const [demosRows, setDemosRows] = useState([]);

  useEffect(() => {
    let demosInRow = 3;
    let rowIndex = 0;
    let rowsItems = [[]];

    // Ensure we only process a number of items that is a multiple of 3 to prevent incomplete rows
    const remainder = demos.length % 3;
    const itemsToProcess = remainder !== 0 ? demos.slice(0, -remainder) : demos;

    itemsToProcess.forEach((demo, i) => {
      if (i > 0 && i % demosInRow === 0) {
        rowIndex++;
        rowsItems[rowIndex] = [];
      }

      rowsItems[rowIndex].push(demo);
    });

    setDemosRows(rowsItems);
  }, []);

  return (
    <section className="demos section-padding" id="demos">
      <div className="container-xxl">
        <div className="row justify-content-center">
          <div className="col-lg-6 col-md-10">
            <div className="sec-head text-center mb-40 animate-fadeUp">
              <h2 className="num">
                <span className="color-grd">
                  PORTAFOLIO<span className="thin"></span>
                </span>
              </h2>
              <h3 className="text-capitalize tw-text-[32px] tw-font-semibold">Sitios web increibles</h3>
             
            </div>
          </div>
        </div>
        {demosRows.map((demos, r) => (
          <div className="row" key={r}>
            {demos.map((demo, i) => (
              <div className="col-lg-4 col-md-6" key={i}>
                <TradingCard demo={demo} index={i} />
              </div>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
};

export default Demos;

