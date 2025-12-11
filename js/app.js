/**
 * ============================================
 * MAIN APPLICATION - Peta Perkembangan Akor
 * ============================================
 */

class ChordProgressionApp {
    constructor() {
        this.currentGenre = 'pop';
        this.currentKey = 'C';
        this.generatedProgression = [];
        this.audioEngine = new AudioEngine();
        
        // Only initialize graph renderer if canvas exists
        const canvas = document.getElementById('chordGraph');
        this.graphRenderer = canvas ? new GraphRenderer('chordGraph') : null;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.initializePage();
    }

    // Initialize based on which page we're on
    initializePage() {
        // Check which elements exist and initialize accordingly
        if (document.getElementById('genreInfo')) {
            this.updateGenreDisplay();
        }
        
        if (document.getElementById('progressionCards')) {
            this.updatePopularProgressions();
        }
        
        if (document.getElementById('chordButtons')) {
            this.updateChordButtons();
        }
        
        // Set callback untuk node click di graf (jika ada)
        if (this.graphRenderer) {
            this.graphRenderer.setOnNodeClick((node) => {
                this.playChordFromNode(node);
            });
        }
    }

    setupEventListeners() {
        // Genre buttons
        document.querySelectorAll('.genre-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.genre-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.currentGenre = e.target.dataset.genre;
                
                if (document.getElementById('genreInfo')) {
                    this.updateGenreDisplay();
                }
                if (document.getElementById('chordButtons')) {
                    this.updateChordButtons();
                }
            });
        });

        // Key selector (multiple selectors on different pages)
        const keySelectors = ['keySelect', 'keySelectGen', 'builderKeySelect'];
        keySelectors.forEach(id => {
            const selector = document.getElementById(id);
            if (selector) {
                selector.addEventListener('change', (e) => {
                    this.currentKey = e.target.value;
                    
                    // Sync all key selectors
                    keySelectors.forEach(otherId => {
                        const otherSelector = document.getElementById(otherId);
                        if (otherSelector && otherSelector !== e.target) {
                            otherSelector.value = e.target.value;
                        }
                    });
                    
                    // Update graf dengan nama chord baru berdasarkan kunci
                    if (this.graphRenderer) {
                        this.updateGenreDisplay();
                    }
                    
                    if (document.getElementById('genreInfo')) {
                        this.updateGenreDisplay();
                    }
                    if (document.getElementById('chordButtons')) {
                        this.updateChordButtons();
                    }
                });
            }
        });

        // Generate button
        const generateBtn = document.getElementById('generateBtn');
        if (generateBtn) {
            generateBtn.addEventListener('click', () => {
                this.generateProgression();
            });
        }

        // Play progression button
        const playBtn = document.getElementById('playProgressionBtn');
        if (playBtn) {
            playBtn.addEventListener('click', () => {
                this.playCurrentProgression();
            });
        }

        // Stop button
        const stopBtn = document.getElementById('stopBtn');
        if (stopBtn) {
            stopBtn.addEventListener('click', () => {
                this.audioEngine.stopAll();
                this.clearPlayingHighlights();
            });
        }

        // Copy progression button (for generator page)
        const copyBtn = document.getElementById('copyProgressionBtn');
        if (copyBtn) {
            copyBtn.addEventListener('click', () => {
                this.copyProgression();
            });
        }

        // Navigation toggle for mobile
        const navToggle = document.getElementById('navToggle');
        const navMenu = document.getElementById('navMenu');
        if (navToggle && navMenu) {
            navToggle.addEventListener('click', () => {
                navMenu.classList.toggle('active');
                navToggle.classList.toggle('active');
            });
        }
    }

    // Update tampilan berdasarkan genre yang dipilih
    updateGenreDisplay() {
        const genreData = ChordData.GENRE_CHORD_GRAPHS[this.currentGenre];
        
        // Update graf (jika ada) dengan translasi ke nama chord
        if (this.graphRenderer) {
            // Buat fungsi translasi untuk mengkonversi numeral ke nama chord
            const translateFunc = (numeral) => {
                const translated = this.translateProgressionToKey([numeral]);
                return translated[0] || numeral;
            };
            this.graphRenderer.updateGraph(genreData.graph, translateFunc);
        }
        
        // Update info section (jika ada)
        const infoContainer = document.getElementById('genreInfo');
        if (infoContainer) {
            this.updateGenreInfo(genreData);
        }
    }

    // Update info section dengan deskripsi genre
    updateGenreInfo(genreData) {
        const infoContainer = document.getElementById('genreInfo');
        if (!infoContainer) return;
        
        let characteristicsHTML = genreData.characteristics.map(c => `<li>${c}</li>`).join('');
        
        let progressionsHTML = genreData.classicProgressions.slice(0, 3).map((prog, idx) => {
            const chordNames = this.translateProgressionToKey(prog).join(' → ');
            return `<li><strong>Pattern ${idx + 1}:</strong> ${chordNames}</li>`;
        }).join('');
        
        infoContainer.innerHTML = `
            <h3>🎵 ${genreData.name}</h3>
            <p>${genreData.description}</p>
            <h4 style="margin-top: 15px; color: #10b981;">Karakteristik:</h4>
            <ul>${characteristicsHTML}</ul>
            <h4 style="margin-top: 15px; color: #f59e0b;">Classic Progressions (dalam ${this.currentKey}):</h4>
            <ul>${progressionsHTML}</ul>
        `;
    }

    // Translate numeral ke chord berdasarkan key
    translateProgressionToKey(numerals) {
        const diatonicChords = ChordData.getDiatonicChords(this.currentKey);
        
        return numerals.map(numeral => {
            // Handle special numerals directly
            if (diatonicChords[numeral]) {
                return diatonicChords[numeral];
            }
            
            // Handle alterations (bVII, #IV, etc.)
            if (numeral.startsWith('b')) {
                const baseNumeral = numeral.substring(1);
                const chord = this.getAlteredChord(baseNumeral, -1);
                return chord;
            }
            if (numeral.startsWith('#')) {
                const baseNumeral = numeral.substring(1);
                const chord = this.getAlteredChord(baseNumeral, 1);
                return chord;
            }
            
            // Handle seventh chords (Imaj7, ii7, V7, vi7, IV7, iii7, etc.)
            if (numeral.includes('7') || numeral.includes('maj7') || numeral.includes('dim7')) {
                // Extract base numeral (remove all suffixes)
                let baseNumeral = numeral
                    .replace('maj7', '')
                    .replace('dim7', '')
                    .replace('7', '')
                    .replace('°', '');
                
                // Try to find in diatonic chords
                let baseChord = diatonicChords[baseNumeral] || 
                               diatonicChords[baseNumeral.toUpperCase()] || 
                               diatonicChords[baseNumeral.toLowerCase()];
                
                // If not found, try to calculate from numeral
                if (!baseChord) {
                    baseChord = this.numeralToChord(baseNumeral);
                }
                
                // Add appropriate suffix
                if (numeral.includes('maj7')) {
                    return baseChord.replace('m', '').replace('dim', '') + 'maj7';
                } else if (numeral.includes('dim7')) {
                    return baseChord.replace('m', '').replace('dim', '') + 'dim7';
                } else if (numeral.includes('7')) {
                    return baseChord + '7';
                }
            }
            
            // Handle diminished chords (viio, vii°)
            if (numeral.includes('°') || numeral.includes('o')) {
                const baseNumeral = numeral.replace('°', '').replace('o', '');
                let baseChord = diatonicChords[baseNumeral + '°'] || 
                               this.numeralToChord(baseNumeral);
                if (!baseChord.includes('dim')) {
                    baseChord = baseChord.replace('m', '') + 'dim';
                }
                return baseChord;
            }
            
            // Fallback: try to calculate chord from numeral
            const calculatedChord = this.numeralToChord(numeral);
            if (calculatedChord !== numeral) {
                return calculatedChord;
            }
            
            // Final fallback: return as is
            return numeral;
        });
    }

    // Convert roman numeral to chord name
    numeralToChord(numeral) {
        const scale = ChordData.getScale(this.currentKey.replace('m', ''), this.currentKey.includes('m') ? 'minor' : 'major');
        const numeralMap = { 'I': 0, 'II': 1, 'III': 2, 'IV': 3, 'V': 4, 'VI': 5, 'VII': 6,
                            'i': 0, 'ii': 1, 'iii': 2, 'iv': 3, 'v': 4, 'vi': 5, 'vii': 6 };
        
        const cleanNumeral = numeral.replace(/[^IViv]/g, '');
        const isMinor = numeral === numeral.toLowerCase() || numeral.includes('m');
        
        const scaleIndex = numeralMap[cleanNumeral] || numeralMap[cleanNumeral.toUpperCase()];
        if (scaleIndex === undefined) return numeral;
        
        let chord = scale[scaleIndex];
        if (isMinor && !chord.includes('m')) {
            chord += 'm';
        }
        
        return chord;
    }

    getAlteredChord(numeral, semitones) {
        const scale = ChordData.getScale(this.currentKey.replace('m', ''));
        const numeralMap = { 'I': 0, 'II': 1, 'III': 2, 'IV': 3, 'V': 4, 'VI': 5, 'VII': 6 };
        
        const baseNumeral = numeral.replace(/[^IViv°]/g, '').toUpperCase();
        const isMinor = numeral.includes('m') || numeral === numeral.toLowerCase();
        const isDim = numeral.includes('dim') || numeral.includes('°');
        const isSeventh = numeral.includes('7');
        
        const scaleIndex = numeralMap[baseNumeral];
        if (scaleIndex === undefined) return numeral;
        
        const rootIndex = ChordData.NOTES.indexOf(scale[scaleIndex]);
        const alteredIndex = (rootIndex + semitones + 12) % 12;
        let chord = ChordData.NOTES[alteredIndex];
        
        if (isDim) chord += 'dim';
        else if (isMinor) chord += 'm';
        if (isSeventh) chord += '7';
        
        return chord;
    }

    // Generate chord progression berdasarkan mode
    generateProgression() {
        const barCount = parseInt(document.getElementById('barCount').value);
        const mode = document.getElementById('generatorMode').value;
        const genreData = ChordData.GENRE_CHORD_GRAPHS[this.currentGenre];
        
        let progression = [];
        
        switch (mode) {
            case 'random':
                progression = this.generateRandomWalk(genreData.graph, barCount);
                break;
            case 'weighted':
                progression = this.generateWeightedWalk(genreData.graph, barCount);
                break;
            case 'classic':
                progression = this.generateClassicPattern(genreData, barCount);
                break;
        }
        
        // Translate ke key yang dipilih
        this.generatedProgression = this.translateProgressionToKey(progression);
        
        this.displayProgression();
        this.analyzeProgression(progression);
    }

    // Random walk pada graf
    generateRandomWalk(graph, steps) {
        const startNode = Object.keys(graph)[0];
        let current = startNode;
        const progression = [current];
        
        for (let i = 0; i < steps - 1; i++) {
            const targets = graph[current].targets;
            if (targets.length === 0) {
                current = startNode;
            } else {
                current = targets[Math.floor(Math.random() * targets.length)];
            }
            progression.push(current);
        }
        
        return progression;
    }

    // Weighted walk berdasarkan bobot
    generateWeightedWalk(graph, steps) {
        const startNode = Object.keys(graph)[0];
        let current = startNode;
        const progression = [current];
        
        for (let i = 0; i < steps - 1; i++) {
            const targets = graph[current].targets;
            const weights = graph[current].weights || targets.map(() => 100 / targets.length);
            
            if (targets.length === 0) {
                current = startNode;
            } else {
                current = this.weightedRandomChoice(targets, weights);
            }
            progression.push(current);
        }
        
        return progression;
    }

    weightedRandomChoice(items, weights) {
        const totalWeight = weights.reduce((sum, w) => sum + w, 0);
        let random = Math.random() * totalWeight;
        
        for (let i = 0; i < items.length; i++) {
            random -= weights[i];
            if (random <= 0) {
                return items[i];
            }
        }
        
        return items[items.length - 1];
    }

    // Generate dari classic patterns
    generateClassicPattern(genreData, targetLength) {
        const patterns = genreData.classicProgressions;
        const selectedPattern = patterns[Math.floor(Math.random() * patterns.length)];
        
        // Repeat pattern untuk mencapai target length
        const progression = [];
        while (progression.length < targetLength) {
            progression.push(...selectedPattern);
        }
        
        return progression.slice(0, targetLength);
    }

    // Display progression di UI
    displayProgression() {
        const container = document.getElementById('progressionResult');
        if (!container) return;
        
        container.innerHTML = '';
        
        this.generatedProgression.forEach((chord, index) => {
            const chordElement = document.createElement('div');
            chordElement.className = 'chord-item';
            chordElement.textContent = chord;
            chordElement.style.animationDelay = `${index * 0.1}s`;
            chordElement.dataset.index = index;
            
            chordElement.addEventListener('click', () => {
                this.audioEngine.playChord(chord);
                this.updateCurrentChordDisplay(chord);
            });
            
            container.appendChild(chordElement);
        });

        // Enable play and copy buttons
        const playBtn = document.getElementById('playProgressionBtn');
        const copyBtn = document.getElementById('copyProgressionBtn');
        const stopBtn = document.getElementById('stopBtn');
        
        if (playBtn) playBtn.disabled = false;
        if (copyBtn) copyBtn.disabled = false;
        if (stopBtn) stopBtn.disabled = false;
    }

    // Copy progression to clipboard
    copyProgression() {
        if (this.generatedProgression.length === 0) return;
        
        const progressionText = this.generatedProgression.join(' - ');
        
        navigator.clipboard.writeText(progressionText).then(() => {
            const copyBtn = document.getElementById('copyProgressionBtn');
            if (copyBtn) {
                const originalText = copyBtn.innerHTML;
                copyBtn.innerHTML = '✅ Copied!';
                setTimeout(() => {
                    copyBtn.innerHTML = originalText;
                }, 2000);
            }
        }).catch(err => {
            console.error('Failed to copy:', err);
            alert(`Progression: ${progressionText}`);
        });
    }

    // Analisis progression
    analyzeProgression(numerals) {
        const container = document.getElementById('progressionAnalysis');
        if (!container) return;
        
        // Hitung statistik
        const uniqueChords = [...new Set(this.generatedProgression)];
        const tonicCount = numerals.filter(n => n.includes('I') && !n.includes('V')).length;
        const dominantCount = numerals.filter(n => n.includes('V')).length;
        
        container.innerHTML = `
            <p><strong>📊 Analisis Progression:</strong></p>
            <p>• Jumlah chord unik: ${uniqueChords.length}</p>
            <p>• Kembali ke Tonic (I): ${tonicCount} kali</p>
            <p>• Dominant (V) count: ${dominantCount} kali</p>
            <p>• Progression ini cocok untuk: ${this.suggestUsage()}</p>
        `;
    }

    suggestUsage() {
        const suggestions = {
            pop: "Verse/Chorus lagu pop, musik iklan, background music",
            rock: "Intro gitar, bridge energetic, anthem crowd-singalong",
            jazz: "Improvisation, cocktail music, sophisticated background",
            blues: "Solo gitar, jam session, emotional ballad",
            country: "Storytelling verses, simple singalong, acoustic set",
            rnb: "Slow jam, romantic ballad, neo-soul groove",
            edm: "Drop section, build-up, festival anthem",
            classical: "Composition exercises, orchestral arrangement, film score"
        };
        
        return suggestions[this.currentGenre] || "berbagai keperluan musik";
    }

    // Play current progression
    async playCurrentProgression() {
        if (this.generatedProgression.length === 0) {
            alert('Generate progression terlebih dahulu!');
            return;
        }

        // Disable play button, enable stop button
        const playBtn = document.getElementById('playProgressionBtn');
        const stopBtn = document.getElementById('stopBtn');
        
        if (playBtn) {
            playBtn.disabled = true;
            playBtn.innerHTML = '🔊 Playing...';
        }
        if (stopBtn) stopBtn.disabled = false;
        
        await this.audioEngine.playProgression(
            this.generatedProgression,
            90,
            (chord, index) => {
                this.highlightPlayingChord(index);
                if (chord) {
                    this.updateCurrentChordDisplay(chord);
                    if (this.graphRenderer) {
                        this.graphRenderer.highlightNode(this.findNumeralForChord(chord));
                    }
                }
            }
        );

        // Re-enable play button after playback finished
        if (playBtn) {
            playBtn.disabled = false;
            playBtn.innerHTML = '▶️ Play Progression';
        }
        this.clearPlayingHighlights();
    }

    findNumeralForChord(chord) {
        const graph = ChordData.GENRE_CHORD_GRAPHS[this.currentGenre].graph;
        const diatonicChords = ChordData.getDiatonicChords(this.currentKey);
        
        for (const [numeral, chordName] of Object.entries(diatonicChords)) {
            if (chordName === chord || chord.startsWith(chordName)) {
                // Find matching key in graph
                for (const graphKey of Object.keys(graph)) {
                    if (graphKey.replace(/[^IViv]/g, '') === numeral.replace(/[^IViv]/g, '')) {
                        return graphKey;
                    }
                }
            }
        }
        
        return Object.keys(graph)[0];
    }

    highlightPlayingChord(index) {
        document.querySelectorAll('.chord-item').forEach((el, i) => {
            el.classList.toggle('playing', i === index);
        });
    }

    clearPlayingHighlights() {
        document.querySelectorAll('.chord-item').forEach(el => {
            el.classList.remove('playing');
        });
        if (this.graphRenderer) {
            this.graphRenderer.clearHighlight();
        }
    }

    // Update chord display
    updateCurrentChordDisplay(chordName) {
        const display = document.getElementById('currentChordDisplay');
        if (!display) return;
        
        const { root, type } = this.audioEngine.parseChord(chordName);
        
        const chordNameEl = display.querySelector('.chord-name');
        const chordTypeEl = display.querySelector('.chord-type');
        
        if (chordNameEl) chordNameEl.textContent = root;
        if (chordTypeEl) chordTypeEl.textContent = this.getChordTypeName(type);
    }

    getChordTypeName(type) {
        const typeNames = {
            '': 'Mayor',
            'm': 'Minor',
            '7': 'Dominant 7th',
            'maj7': 'Major 7th',
            'm7': 'Minor 7th',
            'dim': 'Diminished',
            'dim7': 'Diminished 7th',
            'aug': 'Augmented',
            'sus2': 'Suspended 2nd',
            'sus4': 'Suspended 4th'
        };
        
        return typeNames[type] || type || 'Mayor';
    }

    // Update chord buttons untuk player
    updateChordButtons() {
        const container = document.getElementById('chordButtons');
        if (!container) return;
        
        const diatonicChords = ChordData.getDiatonicChords(this.currentKey);
        
        container.innerHTML = '';
        
        Object.values(diatonicChords).forEach(chord => {
            const button = document.createElement('button');
            button.textContent = chord;
            button.addEventListener('click', () => {
                this.audioEngine.playChord(chord);
                this.updateCurrentChordDisplay(chord);
                
                // Update active state
                container.querySelectorAll('button').forEach(b => b.classList.remove('active'));
                button.classList.add('active');
            });
            container.appendChild(button);
        });
    }

    // Play chord dari node click di graf
    playChordFromNode(node) {
        const translatedChords = this.translateProgressionToKey([node.id]);
        const chord = translatedChords[0];
        this.audioEngine.playChord(chord);
        this.updateCurrentChordDisplay(chord);
    }

    // Update popular progressions cards
    updatePopularProgressions() {
        const container = document.getElementById('progressionCards');
        if (!container) return;
        
        container.innerHTML = '';
        
        ChordData.POPULAR_PROGRESSIONS.forEach(prog => {
            const card = document.createElement('div');
            card.className = 'progression-card';
            
            const chordsInKey = this.translateProgressionToKey(prog.numerals).slice(0, 4);
            
            card.innerHTML = `
                <h4>${prog.name}</h4>
                <div class="chords">${chordsInKey.join(' - ')}</div>
                <p>${prog.description}</p>
                <div class="songs">${prog.songs.slice(0, 2).join(', ')}</div>
                <span class="genre-tag">${prog.genre}</span>
                <button class="play-card-btn" data-progression='${JSON.stringify(prog.numerals)}'>
                    ▶️ Play
                </button>
            `;
            
            // Add click event untuk play button
            card.querySelector('.play-card-btn').addEventListener('click', (e) => {
                const numerals = JSON.parse(e.target.dataset.progression);
                const chords = this.translateProgressionToKey(numerals);
                this.generatedProgression = chords.slice(0, 8);
                this.displayProgression();
                this.playCurrentProgression();
            });
            
            container.appendChild(card);
        });
    }
}

// ============================================
// INTERACTIVE CHORD BUILDER CLASS
// ============================================

class InteractiveChordBuilder {
    constructor(app) {
        this.app = app;
        this.targetChordCount = 8;
        this.builtChords = [];  // Menyimpan chord dalam format nama (C, Am, etc.)
        this.builtNumerals = []; // Menyimpan chord dalam format numeral (I, vi, etc.)
        this.selectedGenre = 'pop';
        this.isComplete = false;
        
        // Only initialize if builder elements exist
        if (document.getElementById('builtProgression')) {
            this.init();
        }
    }

    init() {
        this.setupEventListeners();
        this.renderChordSlots();
        this.renderChordSuggestions();
        this.updateProgress();
    }

    setupEventListeners() {
        // Chord count buttons
        document.querySelectorAll('.count-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.count-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.targetChordCount = parseInt(e.target.dataset.count);
                const customInput = document.getElementById('customChordCount');
                if (customInput) customInput.value = '';
                this.resetBuilder();
            });
        });

        // Custom chord count input
        const customInput = document.getElementById('customChordCount');
        if (customInput) {
            customInput.addEventListener('change', (e) => {
                const value = parseInt(e.target.value);
                if (value >= 2 && value <= 32) {
                    document.querySelectorAll('.count-btn').forEach(b => b.classList.remove('active'));
                    this.targetChordCount = value;
                    this.resetBuilder();
                }
            });
        }

        // Builder genre select
        const genreSelect = document.getElementById('builderGenreSelect');
        if (genreSelect) {
            genreSelect.addEventListener('change', (e) => {
                this.selectedGenre = e.target.value;
                this.renderChordSuggestions();
            });
        }

        // Reset button
        const resetBtn = document.getElementById('resetBuilderBtn');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                this.resetBuilder();
            });
        }

        // Undo button
        const undoBtn = document.getElementById('undoBuilderBtn');
        if (undoBtn) {
            undoBtn.addEventListener('click', () => {
                this.undoLastChord();
            });
        }

        // Play built progression
        const playBtn = document.getElementById('playBuiltProgressionBtn');
        if (playBtn) {
            playBtn.addEventListener('click', () => {
                this.playBuiltProgression();
            });
        }

        // Copy progression
        const copyBtn = document.getElementById('copyBuiltProgressionBtn');
        if (copyBtn) {
            copyBtn.addEventListener('click', () => {
                this.copyProgression();
            });
        }

        // Use in generator
        const useBtn = document.getElementById('useInGeneratorBtn');
        if (useBtn) {
            useBtn.addEventListener('click', () => {
                this.useInGenerator();
            });
        }
    }

    resetBuilder() {
        this.builtChords = [];
        this.builtNumerals = [];
        this.isComplete = false;
        
        this.renderChordSlots();
        this.renderChordSuggestions();
        this.updateProgress();
        this.updateActionButtons();
        
        // Remove completion message if exists
        const completionMsg = document.querySelector('.completion-message');
        if (completionMsg) {
            completionMsg.remove();
        }
        
        const workspace = document.querySelector('.builder-workspace');
        if (workspace) {
            workspace.classList.remove('completed');
        }
    }

    renderChordSlots() {
        const container = document.getElementById('builtProgression');
        if (!container) return;
        
        container.innerHTML = '';

        for (let i = 0; i < this.targetChordCount; i++) {
            const slot = document.createElement('div');
            slot.className = 'chord-slot';
            
            if (i < this.builtChords.length) {
                slot.classList.add('filled');
                slot.textContent = this.builtChords[i];
                slot.dataset.index = i;
                
                // Click untuk play chord
                slot.addEventListener('click', () => {
                    this.app.audioEngine.playChord(this.builtChords[i]);
                    this.app.updateCurrentChordDisplay(this.builtChords[i]);
                });
            } else {
                slot.innerHTML = `<span class="slot-number">${i + 1}</span>`;
                
                if (i === this.builtChords.length) {
                    slot.classList.add('current');
                }
            }
            
            container.appendChild(slot);
        }
    }

    renderChordSuggestions() {
        const container = document.getElementById('chordSuggestions');
        const titleElement = document.getElementById('selectionTitle');
        const infoElement = document.getElementById('suggestionInfo');
        
        if (!container || !titleElement || !infoElement) return;
        
        container.innerHTML = '';
        
        const currentIndex = this.builtChords.length;
        
        if (this.isComplete) {
            titleElement.textContent = '✅ Progression Selesai!';
            container.innerHTML = '<p style="color: var(--secondary-color);">Klik "Play Progression" untuk mendengarkan hasil atau "Reset" untuk mulai ulang.</p>';
            infoElement.innerHTML = '';
            return;
        }
        
        if (currentIndex === 0) {
            // Pilih chord dasar (pertama)
            titleElement.textContent = '🎯 Pilih Chord Dasar (Chord Pertama):';
            infoElement.innerHTML = `
                <strong>💡 Tips:</strong> Chord pertama biasanya menentukan "mood" keseluruhan progression. 
                Pilih chord <strong>I (Tonic)</strong> untuk rasa "stabil", atau <strong>vi</strong> untuk nuansa lebih emosional/sedih.
            `;
            
            this.renderInitialChordOptions(container);
        } else {
            // Saran chord berikutnya berdasarkan chord sebelumnya
            const lastNumeral = this.builtNumerals[this.builtNumerals.length - 1];
            titleElement.textContent = `🎵 Pilih Chord ke-${currentIndex + 1} (setelah ${this.builtChords[currentIndex - 1]}):`;
            
            this.renderSuggestedChords(container, lastNumeral, infoElement);
        }
    }

    renderInitialChordOptions(container) {
        // Tampilkan semua chord diatonic dengan rekomendasi
        const graph = ChordData.GENRE_CHORD_GRAPHS[this.selectedGenre].graph;
        const numerals = Object.keys(graph);
        
        // Sort by typical starting points
        const sortOrder = {
            'I': 1, 'Imaj7': 1,
            'i': 2,
            'vi': 3, 'vi7': 3,
            'IV': 4, 'IV7': 4,
            'ii': 5, 'ii7': 5,
            'V': 6, 'V7': 6,
            'iii': 7, 'iii7': 7
        };
        
        const sortedNumerals = numerals.sort((a, b) => {
            const orderA = sortOrder[a] || 10;
            const orderB = sortOrder[b] || 10;
            return orderA - orderB;
        });
        
        sortedNumerals.forEach(numeral => {
            const chordName = this.app.translateProgressionToKey([numeral])[0];
            const btn = this.createChordButton(chordName, numeral, {
                isRecommended: ['I', 'Imaj7', 'i', 'vi', 'vi7'].includes(numeral),
                isHighlyRecommended: ['I', 'Imaj7', 'i'].includes(numeral)
            });
            container.appendChild(btn);
        });
    }

    renderSuggestedChords(container, lastNumeral, infoElement) {
        const graph = ChordData.GENRE_CHORD_GRAPHS[this.selectedGenre].graph;
        const nodeData = graph[lastNumeral];
        
        if (!nodeData) {
            // Fallback jika numeral tidak ditemukan
            this.renderInitialChordOptions(container);
            infoElement.innerHTML = `<strong>⚠️ Info:</strong> Chord sebelumnya tidak memiliki saran spesifik. Pilih chord yang terasa cocok.`;
            return;
        }
        
        const { targets, weights } = nodeData;
        
        // Render primary suggestions (dari graf)
        let primarySuggestions = document.createElement('div');
        primarySuggestions.className = 'suggestion-group primary';
        primarySuggestions.innerHTML = '<p class="group-label" style="width:100%;text-align:center;color:var(--secondary-color);margin-bottom:10px;font-weight:600;">✨ Rekomendasi Utama:</p>';
        
        targets.forEach((targetNumeral, index) => {
            const chordName = this.app.translateProgressionToKey([targetNumeral])[0];
            const weight = weights ? weights[index] : Math.round(100 / targets.length);
            
            const btn = this.createChordButton(chordName, targetNumeral, {
                isRecommended: weight >= 20,
                isHighlyRecommended: weight >= 35,
                weight: weight
            });
            primarySuggestions.appendChild(btn);
        });
        
        container.appendChild(primarySuggestions);
        
        // Render other options (chords lain yang mungkin)
        const otherNumerals = Object.keys(graph).filter(n => !targets.includes(n));
        
        if (otherNumerals.length > 0) {
            let otherSuggestions = document.createElement('div');
            otherSuggestions.className = 'suggestion-group other';
            otherSuggestions.innerHTML = '<p class="group-label" style="width:100%;text-align:center;color:var(--text-secondary);margin:15px 0 10px 0;font-size:0.9rem;">Opsi Lain (kurang umum):</p>';
            
            otherNumerals.forEach(numeral => {
                const chordName = this.app.translateProgressionToKey([numeral])[0];
                const btn = this.createChordButton(chordName, numeral, {
                    isRecommended: false,
                    isHighlyRecommended: false
                });
                btn.style.opacity = '0.7';
                otherSuggestions.appendChild(btn);
            });
            
            container.appendChild(otherSuggestions);
        }
        
        // Update info berdasarkan last chord
        const chordFunction = nodeData.function || 'default';
        const functionExplanations = {
            'tonic': 'Tonic adalah "rumah" dari progression. Perpindahan ke Dominant (V) atau Subdominant (IV) akan terdengar natural.',
            'dominant': 'Dominant memiliki "tarikan gravitasi" kuat ke Tonic (I). Ini adalah resolusi yang paling memuaskan.',
            'subdominant': 'Subdominant bisa bergerak ke Dominant untuk membangun tensi, atau langsung ke Tonic.',
            'minor': 'Chord minor menambah nuansa emosional. Biasanya bergerak ke chord lain dalam fungsi yang sama atau ke Dominant.',
            'seventh': 'Seventh chord menambah warna. Biasanya sebagai "jembatan" menuju resolusi.'
        };
        
        infoElement.innerHTML = `
            <strong>📖 Tentang ${this.builtChords[this.builtChords.length - 1]} (${lastNumeral}):</strong><br>
            Fungsi: <em>${chordFunction}</em><br>
            ${functionExplanations[chordFunction] || 'Pilih chord yang terasa cocok dengan konteks musik Anda.'}
            <br><br>
            <strong>🎯 Chord dengan 🔥 adalah pilihan paling populer (${weights ? 'berdasarkan bobot' : 'umum digunakan'}).</strong>
        `;
    }

    createChordButton(chordName, numeral, options = {}) {
        const btn = document.createElement('button');
        btn.className = 'suggestion-btn';
        btn.textContent = chordName;
        btn.dataset.numeral = numeral;
        btn.dataset.chord = chordName;
        
        if (options.isHighlyRecommended) {
            btn.classList.add('highly-recommended');
        } else if (options.isRecommended) {
            btn.classList.add('recommended');
        }
        
        btn.addEventListener('click', () => {
            this.selectChord(chordName, numeral);
        });
        
        // Preview chord on hover
        btn.addEventListener('mouseenter', () => {
            this.app.audioEngine.playChord(chordName, 0.3);
        });
        
        return btn;
    }

    selectChord(chordName, numeral) {
        this.builtChords.push(chordName);
        this.builtNumerals.push(numeral);
        
        // Play the selected chord
        this.app.audioEngine.playChord(chordName);
        this.app.updateCurrentChordDisplay(chordName);
        
        // Check if complete
        if (this.builtChords.length >= this.targetChordCount) {
            this.isComplete = true;
            this.onComplete();
        }
        
        this.renderChordSlots();
        this.renderChordSuggestions();
        this.updateProgress();
        this.updateActionButtons();
    }

    undoLastChord() {
        if (this.builtChords.length > 0) {
            this.builtChords.pop();
            this.builtNumerals.pop();
            this.isComplete = false;
            
            // Remove completion message if exists
            const completionMsg = document.querySelector('.completion-message');
            if (completionMsg) {
                completionMsg.remove();
            }
            
            const workspace = document.querySelector('.builder-workspace');
            if (workspace) {
                workspace.classList.remove('completed');
            }
            
            this.renderChordSlots();
            this.renderChordSuggestions();
            this.updateProgress();
            this.updateActionButtons();
        }
    }

    updateProgress() {
        const progressText = document.getElementById('progressText');
        const progressFill = document.getElementById('progressFill');
        
        if (!progressText || !progressFill) return;
        
        const current = this.builtChords.length;
        const total = this.targetChordCount;
        const percentage = (current / total) * 100;
        
        progressText.textContent = `Chord: ${current} / ${total}`;
        progressFill.style.width = `${percentage}%`;
    }

    updateActionButtons() {
        const hasChords = this.builtChords.length > 0;
        
        const undoBtn = document.getElementById('undoBuilderBtn');
        const playBtn = document.getElementById('playBuiltProgressionBtn');
        const copyBtn = document.getElementById('copyBuiltProgressionBtn');
        const useBtn = document.getElementById('useInGeneratorBtn');
        
        if (undoBtn) undoBtn.disabled = !hasChords;
        if (playBtn) playBtn.disabled = !hasChords;
        if (copyBtn) copyBtn.disabled = !hasChords;
        if (useBtn) useBtn.disabled = !hasChords;
    }

    onComplete() {
        const workspace = document.querySelector('.builder-workspace');
        if (workspace) {
            workspace.classList.add('completed');
        }
        
        const selectionArea = document.querySelector('.chord-selection-area');
        if (!selectionArea) return;
        
        // Add completion message
        const completionMsg = document.createElement('div');
        completionMsg.className = 'completion-message';
        completionMsg.innerHTML = `
            <h4>🎉 Progression Selesai!</h4>
            <p>Kamu telah membuat progression: <strong>${this.builtChords.join(' → ')}</strong></p>
            <p>Klik "Play Progression" untuk mendengarkan hasilnya!</p>
        `;
        
        selectionArea.appendChild(completionMsg);
    }

    async playBuiltProgression() {
        if (this.builtChords.length === 0) return;

        // Disable play button during playback
        const playBtn = document.getElementById('playBuiltProgressionBtn');
        if (playBtn) {
            playBtn.disabled = true;
            playBtn.innerHTML = '🔊 Playing...';
        }
        
        await this.app.audioEngine.playProgression(
            this.builtChords,
            90,
            (chord, index) => {
                // Highlight current slot
                document.querySelectorAll('.chord-slot.filled').forEach((el, i) => {
                    el.classList.toggle('current', i === index);
                });
                
                if (chord) {
                    this.app.updateCurrentChordDisplay(chord);
                }
            }
        );
        
        // Clear highlights after playback
        document.querySelectorAll('.chord-slot').forEach(el => {
            el.classList.remove('current');
        });

        // Re-enable play button
        if (playBtn) {
            playBtn.disabled = false;
            playBtn.innerHTML = '▶️ Play Progression';
        }
    }

    copyProgression() {
        const progressionText = this.builtChords.join(' - ');
        const numeralText = this.builtNumerals.join(' - ');
        const fullText = `Chord Progression: ${progressionText}\nNumerals: ${numeralText}`;
        
        navigator.clipboard.writeText(fullText).then(() => {
            // Show feedback
            const copyBtn = document.getElementById('copyBuiltProgressionBtn');
            const originalText = copyBtn.innerHTML;
            copyBtn.innerHTML = '✅ Copied!';
            setTimeout(() => {
                copyBtn.innerHTML = originalText;
            }, 2000);
        }).catch(err => {
            console.error('Failed to copy:', err);
            alert(`Progression: ${progressionText}`);
        });
    }

    useInGenerator() {
        // Transfer built progression ke generator utama
        this.app.generatedProgression = [...this.builtChords];
        this.app.displayProgression();
        
        // Scroll ke generator section (if exists on same page)
        const generatorSection = document.querySelector('.generator-section');
        if (generatorSection) {
            generatorSection.scrollIntoView({ behavior: 'smooth' });
        }
        
        // Show feedback
        const useBtn = document.getElementById('useInGeneratorBtn');
        if (useBtn) {
            const originalText = useBtn.innerHTML;
            useBtn.innerHTML = '✅ Transferred!';
            setTimeout(() => {
                useBtn.innerHTML = originalText;
            }, 2000);
        }
    }
}

// Initialize app ketika DOM ready
document.addEventListener('DOMContentLoaded', () => {
    window.app = new ChordProgressionApp();
    window.chordBuilder = new InteractiveChordBuilder(window.app);
});
