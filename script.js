// script.js - Ohne Kommentare

document.addEventListener('DOMContentLoaded', () => {
    const svgObject = document.getElementById('svgObject');
    const randomizeButton = document.getElementById('randomizeButton');
    const downloadButton = document.getElementById('downloadButton');


    svgObject.addEventListener('load', () => {
        try {
            const svgDocument = svgObject.contentDocument;
            const svgElement = svgDocument.documentElement;

            if (!svgElement) {
                console.error("Konnte das <svg>-Element im geladenen Object nicht finden.");
                 if(randomizeButton) randomizeButton.disabled = true;
                 if(downloadButton) downloadButton.disabled = true;
                return;
            }

            const sliders = document.querySelectorAll('.color-slider');
            const colorPickers = document.querySelectorAll('input[type="color"]');

            sliders.forEach(slider => {
                slider.addEventListener('input', () => {
                    updateColorFromSliders(slider, svgElement);
                });
                 updateColorFromSliders(slider, svgElement);
            });

            colorPickers.forEach(picker => {
                picker.addEventListener('input', () => {
                    updateColorFromPicker(picker, svgElement);
                });
            });

             if (randomizeButton) {
                 randomizeButton.addEventListener('click', () => {
                     randomizeColors(svgElement);
                 });
             } else {
                 console.warn("Randomize button not found.");
             }

              if (downloadButton) {
                  downloadButton.addEventListener('click', () => {
                      downloadSvg(svgElement);
                  });
              } else {
                  console.warn("Download button not found.");
              }


            console.log("SVG geladen und Event Listener hinzugefügt.");

        } catch (e) {
            console.error("Fehler beim Zugriff auf SVG-Inhalt:", e);
            console.warn("Stellen Sie sicher, dass die Datei 'Hase.svg' im selben Ordner liegt und vom Browser geladen werden kann.");
            console.warn("Beachten Sie CORS-Beschränkungen, falls Sie von einer anderen Domain laden (Teste ggf. über einen lokalen Webserver).");
            if(randomizeButton) randomizeButton.disabled = true;
            if(downloadButton) downloadButton.disabled = true;
        }
    });

    svgObject.addEventListener('error', () => {
        console.error("Fehler beim Laden der Datei Hase.svg. Stellen Sie sicher, dass die Datei existiert und der Pfad korrekt ist.");
        if(randomizeButton) randomizeButton.disabled = true;
        if(downloadButton) downloadButton.disabled = true;
    });


    function updateColorFromSliders(triggerSlider, svgElement) {
        const layerId = triggerSlider.dataset.layer;
        const idPrefix = triggerSlider.id.replace(/^slider-|-r$|-g$|-b$/g, '');

        const individualValueSpan = document.getElementById(`value-${triggerSlider.id}`);
         if (individualValueSpan) {
             individualValueSpan.textContent = triggerSlider.value;
         }


        const layerSliders = document.querySelectorAll(`.color-slider[data-layer="${layerId}"]`);
        const colorPicker = document.querySelector(`input[type="color"][data-layer="${layerId}"]`);
        const rgbValueSpan = document.querySelector(`.rgb-value[id="rgb-${idPrefix}"]`);


        let r = 0, g = 0, b = 0;
        layerSliders.forEach(s => {
            const value = parseInt(s.value, 10);
            if (s.dataset.color === 'r') r = value;
            if (s.dataset.color === 'g') g = value;
            if (s.dataset.color === 'b') b = value;
        });

        const newColor = `rgb(${r}, ${g}, ${b})`;
        applySvgColor(svgElement, layerId, newColor);

        if (rgbValueSpan) {
             rgbValueSpan.textContent = newColor;
        }

        if (colorPicker) {
             const hexColor = rgbToHex(r, g, b);
             colorPicker.value = hexColor;
        }
    }

    function updateColorFromPicker(triggerPicker, svgElement) {
        const layerId = triggerPicker.dataset.layer;
        const idPrefix = triggerPicker.id.replace(/^color-/, '');


        const hexColor = triggerPicker.value;

        const rgb = hexToRgb(hexColor);
        if (!rgb) {
            console.error("Ungültiger Hex-Wert vom Colorpicker:", hexColor);
            return;
        }
        const newColor = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;

        applySvgColor(svgElement, layerId, newColor);

        const layerSliders = document.querySelectorAll(`.color-slider[data-layer="${layerId}"]`);
        layerSliders.forEach(s => {
             const colorType = s.dataset.color;
            if (colorType === 'r') s.value = rgb.r;
            if (colorType === 'g') s.value = rgb.g;
            if (colorType === 'b') s.value = rgb.b;

            const individualValueSpan = document.getElementById(`value-${s.id}`);
             if (individualValueSpan) {
                 if (colorType === 'r') individualValueSpan.textContent = rgb.r;
                 if (colorType === 'g') individualValueSpan.textContent = rgb.g;
                 if (colorType === 'b') individualValueSpan.textContent = rgb.b;
             }
        });

        const rgbValueSpan = document.querySelector(`.rgb-value[id="rgb-${idPrefix}"]`);
         if (rgbValueSpan) {
             rgbValueSpan.textContent = newColor;
         }
    }

    function applySvgColor(svgElement, layerId, colorString) {
         const layerElement = svgElement.getElementById(layerId);

         if (layerElement) {
             layerElement.style.fill = colorString;
             layerElement.style.stroke = colorString;
         } else {
             console.warn(`SVG Element mit ID "${layerId}" wurde im Hase.svg nicht gefunden.`);
         }
    }

    function randomizeColors(svgElement) {
        const controllableLayers = document.querySelectorAll('.layer-control');
        controllableLayers.forEach(layerControlDiv => {
            const layerSliders = layerControlDiv.querySelectorAll('.color-slider');

            const randomR = Math.floor(Math.random() * 256);
            const randomG = Math.floor(Math.random() * 256);
            const randomB = Math.floor(Math.random() * 256);

            layerSliders.forEach(s => {
                if (s.dataset.color === 'r') s.value = randomR;
                if (s.dataset.color === 'g') s.value = randomG;
                if (s.dataset.color === 'b') s.value = randomB;
            });

            if (layerSliders.length > 0) {
                const inputEvent = new Event('input', {
                    bubbles: true,
                    cancelable: true
                });
                 layerSliders[0].dispatchEvent(inputEvent);
            }
        });
         console.log("Zufällige Farben zugewiesen.");
    }

    function downloadSvg(svgElement) {
        if (!svgElement) {
            console.error("SVG Element nicht verf\u00FCgbar f\u00FCr Download.");
            return;
        }

        const svgString = new XMLSerializer().serializeToString(svgElement);

        const controllableLayers = document.querySelectorAll('.layer-control');
        let filenameParts = [];
        controllableLayers.forEach(layerControlDiv => {
            const layerId = layerControlDiv.querySelector('.color-slider').dataset.layer;
            const rSlider = layerControlDiv.querySelector('.color-slider[data-color="r"]');
            const gSlider = layerControlDiv.querySelector('.color-slider[data-color="g"]');
            const bSlider = layerControlDiv.querySelector('.color-slider[data-color="b"]');

            if (rSlider && gSlider && bSlider) {
                 const r = rSlider.value;
                 const g = gSlider.value;
                 const b = bSlider.value;
                 filenameParts.push(`${layerId}_${r}_${g}_${b}`);
            } else {
                 console.warn(`Slider f\u00FCr Layer ${layerId} nicht vollst\u00E4ndig gefunden f\u00FCr Dateinamen.`);
                 filenameParts.push(`${layerId}_werte_fehlen`);
            }
        });

        const baseFilename = "Hase";
        const filename = `${baseFilename}_${filenameParts.join('_')}.svg`;

        const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });

        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;

        document.body.appendChild(link);
        link.click();

        setTimeout(() => {
            URL.revokeObjectURL(link.href);
        }, 100);


        console.log(`SVG heruntergeladen als: ${filename}`);
    }


    function rgbToHex(r, g, b) {
        const toHex = (c) => {
            const hex = c.toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        };
        return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
    }

    function hexToRgb(hex) {
        const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
        hex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }

});