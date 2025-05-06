// script.js - Vollständiger Code mit Echtzeit-RGB/Hex, zusammengefasster Auge/Outline, manueller RGB-Eingabe und Herz-Körper-Kopplung

document.addEventListener('DOMContentLoaded', () => {
    const svgObject = document.getElementById('svgObject');
    const randomizeButton = document.getElementById('randomizeButton');
    const downloadButton = document.getElementById('downloadButton');

    // IDs der Layer, die zusammengefasst werden sollen (Outline und Auge)
    const combinedLayerId = 'ID_30'; // Die ID der Outline, die wir behalten
    const layerToCombineId = 'ID_39'; // Die ID des Auges, das wir zusammenfassen

    // IDs der Layer für Körper und Herz
    const bodyLayerId = 'ID_36';
    const heartLayerId = 'ID_45';

    // Selektor für die neue Checkbox
    const linkHeartToBodyCheckbox = document.getElementById('link-heart-to-body');


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
            // Selektoren für Hex- und RGB-Text-Inputs (verwenden data-color)
            const hexInputs = document.querySelectorAll('input[type="text"][data-color="hex"]');
            const rgbInputs = document.querySelectorAll('input[type="text"][data-color="rgb"]');


            // Event Listener für Slider
            sliders.forEach(slider => {
                slider.addEventListener('input', () => {
                    updateColorFromSliders(slider, svgElement);
                });
                 // Initial update on load to set correct colors and display values
                 updateColorFromSliders(slider, svgElement);
            });

            // Event Listener für Colorpicker
            colorPickers.forEach(picker => {
                picker.addEventListener('input', () => {
                    updateColorFromPicker(picker, svgElement);
                });
                 // Initial update for color pickers on load (especially important after combining)
                 // This will also trigger updates for sliders, RGB, and Hex displays
                 // Hinweis: Initiales Update könnte zu doppelten Aufrufen führen,
                 // aber stellt sicher, dass alle Felder synchronisiert sind.
                 updateColorFromPicker(picker, svgElement);
            });

            // Event Listener für Hex-Eingabe
            hexInputs.forEach(hexInput => {
                hexInput.addEventListener('input', () => {
                    updateColorFromHex(hexInput, svgElement);
                });
                 // Initial update for hex inputs on load
                 updateColorFromHex(hexInput, svgElement);
            });

            // Event Listener für RGB-Text-Eingabe
             rgbInputs.forEach(rgbInput => {
                 rgbInput.addEventListener('input', () => {
                     updateColorFromRgbInput(rgbInput, svgElement);
                 });
                  // Initial update on load
                  updateColorFromRgbInput(rgbInput, svgElement);
             });


             // Randomize Button Event Listener
             if (randomizeButton) {
                 randomizeButton.addEventListener('click', () => {
                     randomizeColors(svgElement);
                 });
             } else {
                 console.warn("Randomize button not found.");
             }

              // Download Button Event Listener
              if (downloadButton) {
                  downloadButton.addEventListener('click', () => {
                      downloadSvg(svgElement);
                  });
              } else {
                  console.warn("Download button not found.");
              }

            // Event Listener für die Herz-Körper-Kopplungs-Checkbox
            // Event Listener für die Herz-Körper-Kopplungs-Checkbox
            if (linkHeartToBodyCheckbox) {
                const heartControlsDiv = linkHeartToBodyCheckbox.closest('.layer-control');
                // Wähle alle Elemente aus, die die Farb-Steuerelemente enthalten (Slider-Reihen und color-info Block)
                const heartColorControls = heartControlsDiv ? heartControlsDiv.querySelectorAll('.slider-row, .color-info') : [];

                linkHeartToBodyCheckbox.addEventListener('change', () => {
                    const isChecked = linkHeartToBodyCheckbox.checked;

                    // Steuerelemente des Herzens aktivieren/deaktivieren
                    heartColorControls.forEach(control => {
                        // 'pointer-events: none' verhindert Klicks auf die Elemente
                        control.style.pointerEvents = isChecked ? 'none' : 'auto';
                        // Optional: Opazität reduzieren zur visuellen Rückmeldung
                        control.style.opacity = isChecked ? '0.5' : '1';
                        // Input-Felder und Slider explizit disablen (wichtig für Barrierefreiheit und Formularverhalten)
                        control.querySelectorAll('input, select, button').forEach(input => {
                             input.disabled = isChecked;
                        });
                    });

                    if (isChecked) {
                        // Wenn gekoppelt, Herzfarbe auf Körperfarbe setzen und synchronisieren
                        syncHeartColorToBody(svgElement);
                    } else {
                        // Wenn entkoppelt, die Steuerelemente sind jetzt aktiv.
                        // Wende die Farbe entsprechend dem aktuellen UI-Wert an, um den Zustand zu übernehmen.
                         const heartRgbInput = heartControlsDiv.querySelector('input[type="text"][data-color="rgb"]');
                         if(heartRgbInput) {
                             // Trigger ein Input Event auf dem RGB Feld, um dessen Logik auszulösen
                             heartRgbInput.dispatchEvent(new Event('input', { bubbles: true }));
                         } else {
                              // Fallback: Trigger ein Input Event auf einem Slider, falls RGB-Input fehlt
                              const heartSliders = heartControlsDiv.querySelectorAll('.color-slider');
                              if(heartSliders.length > 0) {
                                  heartSliders[0].dispatchEvent(new Event('input', { bubbles: true }));
                              }
                         }
                    }
                });

                 // Initialen Zustand der Checkbox beim Laden der Seite setzen
                const isInitialChecked = linkHeartToBodyCheckbox.checked;
                 heartColorControls.forEach(control => {
                     control.style.pointerEvents = isInitialChecked ? 'none' : 'auto';
                     control.style.opacity = isInitialChecked ? '0.5' : '1';
                     control.querySelectorAll('input, select, button').forEach(input => {
                         input.disabled = isInitialChecked;
                     });
                 });
                 // Führe die Synchronisation aus, falls die Checkbox initial gecheckt ist
                 if (isInitialChecked) {
                      syncHeartColorToBody(svgElement);
                 }


            } else {
                console.warn("Checkbox 'Herzfarbe wie Körperfarbe' nicht gefunden.");
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

    // Funktion zur Aktualisierung der Farbe basierend auf Slider-Änderungen
    function updateColorFromSliders(triggerSlider, svgElement) {
        const layerId = triggerSlider.dataset.layer;

        const layerSliders = document.querySelectorAll(`.color-slider[data-layer="${layerId}"]`);
        const colorPicker = document.querySelector(`input[type="color"][data-layer="${layerId}"]`);
        // RGB-Input-Feld auswählen über data-layer und data-color="rgb"
        const rgbInput = document.querySelector(`input[type="text"][data-layer="${layerId}"][data-color="rgb"]`);
        const hexInput = document.querySelector(`input[type="text"][data-layer="${layerId}"][data-color="hex"]`);

        let r = 0, g = 0, b = 0;
        layerSliders.forEach(s => {
            const value = parseInt(s.value, 10);
            if (s.dataset.color === 'r') r = value;
            if (s.dataset.color === 'g') g = value;
            if (s.dataset.color === 'b') b = value;
        });

        const newColor = `rgb(${r}, ${g}, ${b})`;

        // Farbe auf den Haupt-Layer anwenden (Fill)
        applySvgColor(svgElement, layerId, newColor);

        // Wenn es sich um den zusammengefassten Layer handelt (Outline), Farbe auch auf das Auge anwenden (Fill und Stroke)
        if (layerId === combinedLayerId) {
            applySvgColor(svgElement, layerToCombineId, newColor); // Auge füllen
             applySvgStrokeColor(svgElement, layerId, newColor); // Outline Stroke (falls vorhanden)
        }

        // RGB-Input-Feld aktualisieren (nur Werte, ohne rgb() und Klammern)
        if (rgbInput) {
            const rgbValues = `${r}, ${g}, ${b}`; // Format "r, g, b"
             rgbInput.value = rgbValues;
        }

        // Colorpicker und Hex-Input aktualisieren
        const hexColor = rgbToHex(r, g, b);
        if (colorPicker) {
             colorPicker.value = hexColor;
        }
        if (hexInput) {
             hexInput.value = hexColor;
        }

        // Prüfe, ob das Herz mit dem Körper gekoppelt ist und der geänderte Layer der Körper ist
        if (linkHeartToBodyCheckbox && linkHeartToBodyCheckbox.checked && layerId === bodyLayerId) {
            syncHeartColorToBody(svgElement); // Synchronisiere die Herzfarbe mit der neuen Körperfarbe
        }
    }

    // Funktion zur Aktualisierung der Farbe basierend auf Colorpicker-Änderungen
    function updateColorFromPicker(triggerPicker, svgElement) {
        const layerId = triggerPicker.dataset.layer;
        const hexColor = triggerPicker.value;

        const rgb = hexToRgb(hexColor);
        if (!rgb) {
            console.error("Ungültiger Hex-Wert vom Colorpicker:", hexColor);
            // Optional: Fehlerzustand beim Hex-Input anzeigen, falls vorhanden
             const hexInput = document.querySelector(`input[type="text"][data-layer="${layerId}"][data-color="hex"]`);
             if(hexInput) hexInput.style.borderColor = 'red';
            return;
        } else {
             const hexInput = document.querySelector(`input[type="text"][data-layer="${layerId}"][data-color="hex"]`);
             if(hexInput) hexInput.style.borderColor = ''; // Rand zurücksetzen
        }
        const newColor = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;

        // Farbe auf den Haupt-Layer anwenden (Fill)
        applySvgColor(svgElement, layerId, newColor);

         // Wenn es sich um den zusammengefassten Layer handelt (Outline), Farbe auch auf das Auge anwenden (Fill und Stroke)
        if (layerId === combinedLayerId) {
             applySvgColor(svgElement, layerToCombineId, newColor); // Auge füllen
             applySvgStrokeColor(svgElement, layerId, newColor); // Outline Stroke (falls vorhanden)
        }

        const layerSliders = document.querySelectorAll(`.color-slider[data-layer="${layerId}"]`);
        const rgbInput = document.querySelector(`input[type="text"][data-layer="${layerId}"][data-color="rgb"]`);
        const hexInput = document.querySelector(`input[type="text"][data-layer="${layerId}"][data-color="hex"]`);


        // Slider aktualisieren
        layerSliders.forEach(s => {
             const colorType = s.dataset.color;
            if (colorType === 'r') s.value = rgb.r;
            if (colorType === 'g') s.value = rgb.g;
            if (colorType === 'b') s.value = rgb.b;
        });

        // RGB-Input-Feld aktualisieren (nur Werte)
        if (rgbInput) {
             const rgbValues = `${rgb.r}, ${rgb.g}, ${rgb.b}`;
             rgbInput.value = rgbValues;
        }

        // Hex-Input aktualisieren (Dieser wird vom Colorpicker direkt gesetzt, aber zur Konsistenz hier)
        if (hexInput) {
             hexInput.value = hexColor;
        }

         // Prüfe, ob das Herz mit dem Körper gekoppelt ist und der geänderte Layer der Körper ist
        if (linkHeartToBodyCheckbox && linkHeartToBodyCheckbox.checked && layerId === bodyLayerId) {
            syncHeartColorToBody(svgElement); // Synchronisiere die Herzfarbe mit der neuen Körperfarbe
        }
    }

    // Funktion zur Aktualisierung der Farbe basierend auf Hex-Eingabe
    function updateColorFromHex(triggerHexInput, svgElement) {
        const layerId = triggerHexInput.dataset.layer;
        const hexColor = triggerHexInput.value.trim(); // Wert lesen und Leerzeichen entfernen

        const rgb = hexToRgb(hexColor);
        if (!rgb) {
            console.error("Ungültiger Hex-Wert von der Eingabe:", hexColor);
            // Optional: Fehlerzustand im UI anzeigen (z.B. Rand des Input-Feldes rot färben)
             triggerHexInput.style.borderColor = 'red';
            return;
        } else {
             triggerHexInput.style.borderColor = ''; // Setze den Rand zurück, wenn der Wert gültig ist
        }
        const newColor = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;

        // Farbe auf den Haupt-Layer anwenden (Fill)
        applySvgColor(svgElement, layerId, newColor);

         // Wenn es sich um den zusammengefassten Layer handelt (Outline), Farbe auch auf das Auge anwenden (Fill und Stroke)
        if (layerId === combinedLayerId) {
             applySvgColor(svgElement, layerToCombineId, newColor); // Auge füllen
             applySvgStrokeColor(svgElement, layerId, newColor); // Outline Stroke (falls vorhanden)
        }

        const layerSliders = document.querySelectorAll(`.color-slider[data-layer="${layerId}"]`);
        const colorPicker = document.querySelector(`input[type="color"][data-layer="${layerId}"]`);
        const rgbInput = document.querySelector(`input[type="text"][data-layer="${layerId}"][data-color="rgb"]`);

        // Slider aktualisieren
        layerSliders.forEach(s => {
             const colorType = s.dataset.color;
            if (colorType === 'r') s.value = rgb.r;
            if (colorType === 'g') s.value = rgb.g;
            if (colorType === 'b') s.value = rgb.b;
        });

        // Colorpicker aktualisieren
        if (colorPicker) {
            colorPicker.value = hexColor;
        }

        // RGB-Input-Feld aktualisieren (nur Werte)
        if (rgbInput) {
             const rgbValues = `${rgb.r}, ${rgb.g}, ${rgb.b}`;
             rgbInput.value = rgbValues;
        }

         // Prüfe, ob das Herz mit dem Körper gekoppelt ist und der geänderte Layer der Körper ist
        if (linkHeartToBodyCheckbox && linkHeartToBodyCheckbox.checked && layerId === bodyLayerId) {
            syncHeartColorToBody(svgElement); // Synchronisiere die Herzfarbe mit der neuen Körperfarbe
        }
    }

    // Funktion zur Aktualisierung der Farbe basierend auf RGB-Text-Eingabe
    function updateColorFromRgbInput(triggerRgbInput, svgElement) {
        const layerId = triggerRgbInput.dataset.layer;
        const rgbString = triggerRgbInput.value.trim(); // Wert lesen und Leerzeichen entfernen

        // Versuche den RGB-String zu parsen (erwartet "r, g, b" oder "rgb(r, g, b)")
        const rgb = parseRgbString(rgbString);

        if (!rgb) {
            console.error("Ungültiger RGB-Wert von der Eingabe:", rgbString);
            // Optional: Fehlerzustand im UI anzeigen (z.B. Rand des Input-Feldes rot färben)
             triggerRgbInput.style.borderColor = 'red';
            return;
        } else {
             triggerRgbInput.style.borderColor = ''; // Rand zurücksetzen
        }

        const newColor = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;

        // Farbe auf den Haupt-Layer anwenden (Fill)
        applySvgColor(svgElement, layerId, newColor);

        // Wenn es sich um den zusammengefassten Layer handelt (Outline), Farbe auch auf das Auge anwenden (Fill und Stroke)
        if (layerId === combinedLayerId) {
            applySvgColor(svgElement, layerToCombineId, newColor); // Auge füllen
             applySvgStrokeColor(svgElement, layerId, newColor); // Outline Stroke (falls vorhanden)
        }

        // Jetzt die anderen Steuerelemente aktualisieren: Slider, Colorpicker, Hex-Input
        const layerSliders = document.querySelectorAll(`.color-slider[data-layer="${layerId}"]`);
        const colorPicker = document.querySelector(`input[type="color"][data-layer="${layerId}"]`);
        const hexInput = document.querySelector(`input[type="text"][data-layer="${layerId}"][data-color="hex"]`);

        // Slider aktualisieren
        layerSliders.forEach(s => {
             const colorType = s.dataset.color;
            if (colorType === 'r') s.value = rgb.r;
            if (colorType === 'g') s.value = rgb.g;
            if (colorType === 'b') s.value = rgb.b;
        });

        // Colorpicker aktualisieren
        const hexColor = rgbToHex(rgb.r, rgb.g, rgb.b);
        if (colorPicker) {
            colorPicker.value = hexColor;
        }

        // Hex-Input aktualisieren
        if (hexInput) {
            hexInput.value = hexColor;
        }

         // Prüfe, ob das Herz mit dem Körper gekoppelt ist und der geänderte Layer der Körper ist
        if (linkHeartToBodyCheckbox && linkHeartToBodyCheckbox.checked && layerId === bodyLayerId) {
            syncHeartColorToBody(svgElement); // Synchronisiere die Herzfarbe mit der neuen Körperfarbe
        }
    }


    // Funktion zum Synchronisieren der Herzfarbe mit der Körperfarbe
    function syncHeartColorToBody(svgElement) {
        // Finde das Control-Div für den Körper-Layer
        const bodyLayerControl = document.querySelector(`.layer-control [data-layer="${bodyLayerId}"]`) ?
                                 document.querySelector(`.layer-control [data-layer="${bodyLayerId}"]`).closest('.layer-control') :
                                 null;

        if (!bodyLayerControl) {
            console.warn("Körper Layer Control nicht gefunden.");
            return;
        }

        // Versuche die aktuelle Farbe aus dem RGB-Input-Feld des Körpers zu lesen
        const bodyRgbInput = bodyLayerControl.querySelector('input[type="text"][data-color="rgb"]');
        let rgb = null;

        if (bodyRgbInput && bodyRgbInput.value) {
            rgb = parseRgbString(bodyRgbInput.value.trim());
        }

        // Fallback falls RGB-Input nicht da ist oder ungültig, lese von Slidern
        if (!rgb) {
             const bodySliders = bodyLayerControl.querySelectorAll('.color-slider[data-layer="'+ bodyLayerId +'"]');
             let r = 0, g = 0, b = 0;
             bodySliders.forEach(s => {
                const value = parseInt(s.value, 10);
                if (s.dataset.color === 'r') r = value;
                if (s.dataset.color === 'g') g = value;
                if (s.dataset.color === 'b') b = value;
            });
            rgb = {r, g, b};
        }

        const newColor = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
        const hexColor = rgbToHex(rgb.r, rgb.g, rgb.b);
        const rgbValuesString = `${rgb.r}, ${rgb.g}, ${rgb.b}`; // Format "r, g, b"


        // Farbe auf das Herz SVG anwenden (Fill und Stroke)
        applySvgColor(svgElement, heartLayerId, newColor);
        applySvgStrokeColor(svgElement, heartLayerId, newColor); // Herz hat eventuell auch Stroke

        // Steuerelemente des Herzens aktualisieren (sollten disabled sein, aber Werte anzeigen)
        const heartLayerControl = document.querySelector(`.layer-control [data-layer="${heartLayerId}"]`) ?
                                  document.querySelector(`.layer-control [data-layer="${heartLayerId}"]`).closest('.layer-control') :
                                  null;

        if (heartLayerControl) {
            const heartSliders = heartLayerControl.querySelectorAll('.color-slider');
            const heartColorPicker = heartLayerControl.querySelector('input[type="color"]');
            const heartRgbInput = heartLayerControl.querySelector('input[type="text"][data-color="rgb"]');
            const heartHexInput = heartLayerControl.querySelector('input[type="text"][data-color="hex"]');

            // Werte in den Herz-Steuerelementen setzen
            heartSliders.forEach(s => {
                if (s.dataset.color === 'r') s.value = rgb.r;
                if (s.dataset.color === 'g') s.value = rgb.g;
                if (s.dataset.color === 'b') s.value = rgb.b;
            });
            if (heartColorPicker) heartColorPicker.value = hexColor;
            if (heartRgbInput) heartRgbInput.value = rgbValuesString;
            if (heartHexInput) heartHexInput.value = hexColor;

        } else {
             console.warn("Herz Layer Control nicht gefunden.");
        }
    }


    // Funktion zum Anwenden der Farbe auf ein SVG-Element (Fill)
    function applySvgColor(svgElement, layerId, colorString) {
         const layerElement = svgElement.getElementById(layerId);

         if (layerElement) {
             layerElement.style.fill = colorString;
         } else {
             console.warn(`SVG Element mit ID "${layerId}" wurde im Hase.svg nicht gefunden (Fill).`);
         }
    }

     // Funktion zum Anwenden der Stroke-Farbe auf ein SVG-Element
     function applySvgStrokeColor(svgElement, layerId, colorString) {
          const layerElement = svgElement.getElementById(layerId);
          if (layerElement) {
              // Stelle sicher, dass der Stroke auch existiert, bevor er gesetzt wird
              if (layerElement.style.stroke !== undefined) {
                 layerElement.style.stroke = colorString;
              }
          } else {
              console.warn(`SVG Element mit ID "${layerId}" wurde im Hase.svg nicht gefunden (Stroke).`);
          }
     }

    // Funktion zum Zufälligen Färben aller steuerbaren Layer
    function randomizeColors(svgElement) {
        const controllableLayers = document.querySelectorAll('.layer-control');
        controllableLayers.forEach(layerControlDiv => {
            // Wir holen die Layer ID von einem der data-layer Attribute im Control-Div
            const layerIdElement = layerControlDiv.querySelector('[data-layer]');
            if (!layerIdElement) {
                 console.warn("Layer ID Element nicht gefunden in einem Layer Control Div.");
                 return; // Springe zum nächsten Div, wenn keine Layer-ID gefunden wird
            }
            const layerId = layerIdElement.dataset.layer;

            // Prüfe, ob dies der Herz-Layer ist und die Kopplung aktiv ist
            const isHeartLayerAndLinked = (layerId === heartLayerId && linkHeartToBodyCheckbox && linkHeartToBodyCheckbox.checked);

            // Überspringe den Herz-Layer, wenn er gekoppelt ist, da seine Farbe vom Körper gesetzt wird
            if (isHeartLayerAndLinked) {
                 // Die Farbe wird nach der Körper-Randomisierung synchronisiert
                 return;
            }

            const layerSliders = layerControlDiv.querySelectorAll('.color-slider');
            const colorPicker = layerControlDiv.querySelector('input[type="color"]');
            const rgbInput = layerControlDiv.querySelector('input[type="text"][data-color="rgb"]'); // RGB-Input auswählen
            const hexInput = layerControlDiv.querySelector('input[type="text"][data-color="hex"]'); // Hex-Input auswählen

            const randomR = Math.floor(Math.random() * 256);
            const randomG = Math.floor(Math.random() * 256);
            const randomB = Math.floor(Math.random() * 256);
            const randomHex = rgbToHex(randomR, randomG, randomB);
            const randomRgbString = `rgb(${randomR}, ${randomG}, ${randomB})`;

            // Farbe auf den Haupt-Layer anwenden (Fill)
             applySvgColor(svgElement, layerId, randomRgbString);

             // Wenn es sich um den zusammengefassten Layer handelt (Outline), Farbe auch auf das Auge anwenden (Fill und Stroke)
            if (layerId === combinedLayerId) {
                 applySvgColor(svgElement, layerToCombineId, randomRgbString); // Auge füllen
                 applySvgStrokeColor(svgElement, layerId, randomRgbString); // Outline Stroke
            } else {
                 // Für andere Layer, die keine Outline sind, setzen wir den Stroke eventuell auf transparent oder entfernen ihn, falls er nicht benötigt wird
                 // Dies hängt davon ab, wie deine SVG aufgebaut ist. Standardmäßig setzen wir hier nur den Fill.
                 // Wenn andere Layer Strokes haben und diese auch zufällig gefärbt werden sollen, muss die Logik hier erweitert werden.
            }

            // Slider aktualisieren
            layerSliders.forEach(s => {
                if (s.dataset.color === 'r') s.value = randomR;
                if (s.dataset.color === 'g') s.value = randomG;
                if (s.dataset.color === 'b') s.value = randomB;
            });

            // Colorpicker, RGB-Anzeige und Hex-Eingabe aktualisieren
            if (colorPicker) colorPicker.value = randomHex;
            // RGB-Input aktualisieren (nur Werte)
            if (rgbInput) {
                 const rgbValues = `${randomR}, ${randomG}, ${randomB}`;
                 rgbInput.value = rgbValues;
            }
            // Hex-Input aktualisieren
            if (hexInput) {
                 hexInput.value = randomHex;
            }

        }); // Ende der controllableLayers.forEach Schleife

         // Nach dem Zufälligen Färben aller anderen Layer:
         // Prüfe, ob das Herz mit dem Körper gekoppelt ist und synchronisiere, falls nötig
        if (linkHeartToBodyCheckbox && linkHeartToBodyCheckbox.checked) {
             syncHeartColorToBody(svgElement); // Setze die Herzfarbe auf die (zufällige) Körperfarbe
        }

         console.log("Zufällige Farben zugewiesen.");
    }

    // Funktion zum Herunterladen der modifizierten SVG
    function downloadSvg(svgElement) {
        if (!svgElement) {
            console.error("SVG Element nicht verfügbar für Download.");
            return;
        }

        // Klonen Sie das SVG-Element, um die Stile direkt im SVG zu speichern
        const clonedSvgElement = svgElement.cloneNode(true);

        // Da die Stile durch JavaScript als Inline-Styles gesetzt werden,
        // sollten sie beim Klonen direkt mitkopiert werden.
        // Zusätzliche Schritte zur Übertragung der Stile sind normalerweise nicht notwendig,
        // wenn Stile über element.style.fill/stroke gesetzt wurden.
        // Die einfache Klonung sollte ausreichen, da element.style direkt im DOM des geklonten Elements ist.

        const svgString = new XMLSerializer().serializeToString(clonedSvgElement);

        const controllableLayers = document.querySelectorAll('.layer-control');
        let filenameParts = [];
        controllableLayers.forEach(layerControlDiv => {
             // Wir holen die Layer ID von einem der data-layer Attribute im Control-Div
            const layerIdElement = layerControlDiv.querySelector('[data-layer]');
             if (!layerIdElement) {
                 console.warn("Layer ID Element nicht gefunden in einem Layer Control Div für Dateinamen.");
                 return; // Springe zum nächsten Div
             }
            const layerId = layerIdElement.dataset.layer;

             // Überspringe den Herz-Layer im Dateinamen, wenn er gekoppelt ist
             if (layerId === heartLayerId && linkHeartToBodyCheckbox && linkHeartToBodyCheckbox.checked) {
                 // Stattdessen fügen wir die Körperfarbe mit hinzu, da das Herz dieselbe Farbe hat
                 // Wir nehmen an, dass der Körper-Layer bereits verarbeitet wurde oder noch kommt.
                 // Um Duplikate zu vermeiden, fügen wir die Herz-Info nur hinzu, wenn der Körper verarbeitet wurde.
                 // Eine einfachere Methode ist, IMMER alle Layer-Farben in den Namen aufzunehmen,
                 // unabhängig von der Kopplung. Der Benutzer weiß ja, dass die Farbe gleich ist.
                 // Wir behalten die Logik bei, jeden Layer einzeln zu benennen.
             }


            // Versuche den Hex-Wert für den Dateinamen zu bekommen
            const hexInput = layerControlDiv.querySelector('input[type="text"][data-color="hex"]');

            if (hexInput && hexInput.value) {
                 const hexValue = hexInput.value.replace('#', ''); // # entfernen
                 filenameParts.push(`${layerId}_${hexValue}`);
            } else {
                 // Fallback, falls Hex-Wert nicht verfügbar ist
                 console.warn(`Hex-Input für Layer ${layerId} nicht gefunden oder leer für Dateinamen.`);
                 // Optional: Fallback auf RGB-Werte aus dem RGB-Input-Feld
                 const rgbInput = layerControlDiv.querySelector('input[type="text"][data-color="rgb"]');
                 if (rgbInput && rgbInput.value) {
                     // RGB-Werte für Dateinamen formatieren (Kommas entfernen, etc.)
                     const rgbValue = rgbInput.value.replace(/[\s,]/g, '_'); // Leerzeichen und Kommas durch Unterstrich ersetzen
                     filenameParts.push(`${layerId}_rgb_${rgbValue}`);
                 } else {
                    // Letzter Fallback
                    filenameParts.push(`${layerId}_werte_fehlen`);
                 }
            }
        });

        const baseFilename = "Hase";
        // Dateinamen sicherer machen, unerlaubte Zeichen entfernen oder ersetzen
        // Erlauben wir Buchstaben, Zahlen, Unterstriche, Klammern und Kommas (falls RGB Fallback genutzt wird)
        const safeFilenameParts = filenameParts.map(part => part.replace(/[^a-zA-Z0-9_(),#]/g, '_'));
        const filename = `${baseFilename}_${safeFilenameParts.join('_')}.svg`;

        const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });

        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;

        document.body.appendChild(link);
        link.click();

        setTimeout(() => {
            URL.revokeObjectURL(link.href);
            document.body.removeChild(link); // Link entfernen nach Download
        }, 100);

        console.log(`SVG heruntergeladen als: ${filename}`);
    }

    // Hilfsfunktion zur Konvertierung von RGB zu Hex
    function rgbToHex(r, g, b) {
        const toHex = (c) => {
            const hex = parseInt(c, 10).toString(16); // Sicherstellen, dass c eine Zahl ist
            return hex.length === 1 ? '0' + hex : hex;
        };
        return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
    }

    // Hilfsfunktion zur Konvertierung von Hex zu RGB
    function hexToRgb(hex) {
        // Entferne optional ein führendes '#'
        hex = hex.replace(/^#/, '');

        // Überprüfe, ob es sich um einen 3- oder 6-stelligen Hex-Code handelt
        const shorthandRegex = /^([a-f\d])([a-f\d])([a-f\d])$/i;
        // KORRIGIERT: Tippfehler "shorth shorthandRegex" zu "shorthandRegex"
        hex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);

        const result = /^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);

        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null; // Gibt null zurück, wenn der Hex-Code ungültig ist
    }

    // NEUE Hilfsfunktion zum Parsen eines RGB-Strings (z.B. "r, g, b" oder "rgb(r, g, b)")
    function parseRgbString(rgbString) {
        // Entferne "rgb(", ")", und alle Leerzeichen (inkl. Tabs, Zeilenumbrüche etc.)
        const cleanedString = rgbString.replace(/^rgb\(|\)$|\s/g, '');
        const values = cleanedString.split(',');

        if (values.length === 3) {
            const r = parseInt(values[0], 10);
            const g = parseInt(values[1], 10);
            const b = parseInt(values[2], 10);

            // Überprüfe, ob die Werte gültige Zahlen zwischen 0 und 255 sind
            if (!isNaN(r) && !isNaN(g) && !isNaN(b) &&
                r >= 0 && r <= 255 &&
                g >= 0 && g <= 255 &&
                b >= 0 && b <= 255) {
                return { r, g, b };
            }
        }
        return null; // Ungültiges Format oder ungültige Werte
    }

});
