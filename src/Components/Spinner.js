import React from 'react';
import styles from './Spiner.module.css';

const Spinner = (props) => {
  return (
    <div className={styles.parent}>
      <div className={styles.spinner}>
        <div className={styles.circle}></div>
      </div>
    </div>
  );
};

export default Spinner;