import React, { useState } from "react";

function Pagination ({ resultsPerPage, totalresults, paginate }) {
  const pagNumber = [];
  for (let i = 1; i < Math.ceil(totalresults / resultsPerPage); i++) {
    pagNumber.push(i);
  }
  const [activePage, setActivePage] = useState(1);

  const handlePageClick = (number) => {
    setActivePage(number);
    paginate(number);
  }
  return (
    <div>
      <nav>
        <ul>
          {
            pagNumber.map((num) => {
              <li key={num}>
                <a
                href="!#"
                onClick={() => {
                  handlePageClick(num);
                  paginate(num);
                }}>{num}</a>
              </li>
            })
          }
        </ul>
      </nav>
    </div>
  )

}

export default Pagination;