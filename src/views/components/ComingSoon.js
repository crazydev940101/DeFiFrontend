import React, { useState, useEffect } from 'react';

function ComingSoonComponent() {

  const [colorIndex, setColorIndex] = useState(0);
  const colors = ['red', 'green', 'blue', 'yellow', 'purple', 'pink', 'black'];

  useEffect(() => {
    const intervalID = setInterval(() => {
      setColorIndex((colorIndex) => (colorIndex + 1) % colors.length);
    }, 1000);

    return () => clearInterval(intervalID);
  }, [colors.length]);

  return (
    <p style={{color:colors[colorIndex], fontSize: "20px", textAlign: "center"}}>Coming soon...</p>
  );
}

export default ComingSoonComponent;