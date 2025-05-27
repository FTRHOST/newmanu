import React, { useState, useRef, useEffect } from "react";
import { AiFillPauseCircle, AiFillPlayCircle } from "react-icons/ai";

const VideoPlayer = ({ videoSrc, posterSrc }) => {
  // Inisialisasi isPlaying ke true untuk mencoba autoplay
  const [isPlaying, setIsPlaying] = useState(true);
  const videoRef = useRef(null);

  const togglePlay = () => {
    if (videoRef.current) {
      if (videoRef.current.paused || videoRef.current.ended) {
        videoRef.current.play()
          .then(() => setIsPlaying(true))
          .catch(error => {
            console.error("Error saat mencoba play setelah toggle:", error);
            setIsPlaying(false); // Tetap false jika ada error
          });
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  };

  // Efek untuk mengontrol play/pause berdasarkan state isPlaying
  // Ini juga akan menangani upaya autoplay awal karena isPlaying awalnya true
  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      if (isPlaying) {
        // Atribut muted sangat penting untuk autoplay di banyak browser
        // Pastikan sudah di-set di JSX, atau bisa juga di-set di sini secara programatik jika perlu:
        // video.muted = true;
        const playPromise = video.play();
        if (playPromise !== undefined) {
          playPromise.catch(error => {
            // Autoplay kemungkinan dicegah oleh browser
            console.error("Autoplay dicegah oleh browser:", error);
            // Update state untuk mencerminkan bahwa video tidak berputar
            setIsPlaying(false);
          });
        }
      } else {
        video.pause();
      }
    }
    // Dependensi pada isPlaying agar efek ini berjalan saat isPlaying berubah
    // dan pada videoSrc jika sumber video bisa berubah dinamis (untuk memuat ulang dan mencoba autoplay lagi)
  }, [isPlaying, videoSrc]); // Tambahkan videoSrc jika video bisa berganti

  // Efek ini menangani looping video (jika atribut `loop` tidak cukup atau ada logika khusus)
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleEnded = () => {
      // Jika atribut 'loop' sudah ada di tag <video>, baris ini mungkin tidak diperlukan
      // kecuali Anda ingin memastikan 'isPlaying' tetap true.
      video.currentTime = 0;
      video.play()
        .then(() => setIsPlaying(true)) // Pastikan state konsisten
        .catch(error => {
          console.error("Autoplay dicegah setelah video selesai (looping):", error);
          setIsPlaying(false); // Update state jika gagal play lagi
        });
    };

    video.addEventListener("ended", handleEnded);

    return () => {
      video.removeEventListener("ended", handleEnded);
    };
  }, [videoSrc]); // Jalankan ulang jika videoSrc berubah

  return (
    <div className="relative">
      <video
        className="rounded-[40px]"
        ref={videoRef}
        width="1920" // Sebaiknya gunakan CSS untuk styling ukuran
        height="1080" // Sebaiknya gunakan CSS untuk styling ukuran
        poster={posterSrc}
        onClick={togglePlay} // Memungkinkan klik pada video untuk play/pause
        playsInline // Penting untuk pengalaman inline di iOS
        muted // SANGAT PENTING untuk autoplay di sebagian besar browser
        autoPlay // Browser akan mencoba autoplay jika muted dan kebijakan memperbolehkan
        loop // Atribut HTML untuk looping otomatis
      >
        <source src={videoSrc} type="video/mp4" />
        Browser Anda tidak mendukung tag video.
      </video>
      <div className="absolute bottom-4 right-4">
        {isPlaying ? (
          <AiFillPauseCircle
            className="text-4xl text-white cursor-pointer fill-(--color-primary)" // Hapus fill-(--color-primary) jika tidak terdefinisi
            onClick={togglePlay}
            aria-label="Pause video"
          />
        ) : (
          <AiFillPlayCircle
            className="text-4xl text-white cursor-pointer fill-(--color-primary)" // Hapus fill-(--color-primary) jika tidak terdefinisi
            onClick={togglePlay}
            aria-label="Play video"
          />
        )}
      </div>
    </div>
  );
};

export default VideoPlayer;