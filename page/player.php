<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Chord Player - Peta Perkembangan Akor</title>
    <link rel="stylesheet" href="../styles.css">
</head>
<body>
    <?php include '../nav.php'; ?>

    <div class="container">
        <!-- Page Header -->
        <header class="page-header">
            <h1>🎹 Chord Player</h1>
            <p class="page-description">Mainkan dan dengarkan chord secara interaktif</p>
        </header>

        <main>
            <!-- Key Selection -->
            <section class="key-section">
                <h2>🎼 Pilih Kunci Dasar</h2>
                <div class="key-selector">
                    <select id="keySelect" title="Pilih kunci dasar">
                        <option value="C">C Mayor</option>
                        <option value="G">G Mayor</option>
                        <option value="D">D Mayor</option>
                        <option value="A">A Mayor</option>
                        <option value="E">E Mayor</option>
                        <option value="F">F Mayor</option>
                        <option value="Bb">Bb Mayor</option>
                        <option value="Am">A Minor</option>
                        <option value="Em">E Minor</option>
                        <option value="Dm">D Minor</option>
                    </select>
                </div>
            </section>

            <!-- Interactive Chord Player -->
            <section class="player-section">
                <h2>🎵 Chord Player Interaktif</h2>
                <p class="player-instruction">Klik pada tombol chord untuk mendengar suaranya</p>
                
                <div id="currentChordDisplay" class="current-chord">
                    <span class="chord-name">C</span>
                    <span class="chord-type">Mayor</span>
                </div>
                
                <div class="chord-buttons" id="chordButtons">
                    <!-- Tombol akor akan diisi JavaScript -->
                </div>
                
                <div class="player-controls">
                    <button id="playProgressionBtn" class="play-btn">▶️ Play Progression</button>
                    <button id="stopBtn" class="stop-btn">⏹️ Stop</button>
                </div>
            </section>

            <!-- Custom Progression Input -->
            <section class="custom-progression-section">
                <h2>✏️ Input Custom Progression</h2>
                <div class="custom-input-area">
                    <label for="customProgressionInput">Masukkan chord progression (pisahkan dengan koma atau spasi):</label>
                    <input type="text" id="customProgressionInput" placeholder="C, G, Am, F" class="custom-input" title="Input custom progression">
                    <button id="parseCustomBtn" class="generate-btn">🎵 Parse & Play</button>
                </div>
                <div id="parsedChords" class="progression-display">
                    <!-- Parsed chords will appear here -->
                </div>
            </section>

            <!-- Volume & Tempo Controls -->
            <section class="controls-section">
                <h2>⚙️ Kontrol Audio</h2>
                <div class="audio-controls">
                    <div class="control-group">
                        <label for="volumeSlider">Volume:</label>
                        <input type="range" id="volumeSlider" min="0" max="100" value="70" class="slider" title="Atur volume">
                        <span id="volumeValue">70%</span>
                    </div>
                    <div class="control-group">
                        <label for="tempoSlider">Tempo (BPM):</label>
                        <input type="range" id="tempoSlider" min="40" max="200" value="120" class="slider" title="Atur tempo">
                        <span id="tempoValue">120</span>
                    </div>
                </div>
            </section>
        </main>
    </div>

    <script src="../js/chordData.js"></script>
    <script src="../js/audioEngine.js"></script>
    <script src="../js/graphRenderer.js"></script>
    <script src="../js/app.js"></script>
</body>
</html>
