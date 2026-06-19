"use client";

import { useEffect, useRef } from "react";

export default function HomePage() {
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("active");
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
    );

    document.querySelectorAll(".reveal").forEach((el) => {
      observerRef.current?.observe(el);
    });

    // Parallax for floating shapes
    const handleScroll = () => {
      const scrolled = window.pageYOffset;
      document.querySelectorAll(".floating-shape").forEach((shape, index) => {
        const speed = (index + 1) * 0.05;
        (shape as HTMLElement).style.transform = `translateY(${scrolled * speed}px) rotate(${scrolled * 0.02}deg)`;
      });
    };
    window.addEventListener("scroll", handleScroll);

    // Button press interactions
    const handleMouseDown = (e: MouseEvent) => {
      (e.currentTarget as HTMLElement).style.transform = "scale(0.96)";
    };
    const handleMouseUp = (e: MouseEvent) => {
      (e.currentTarget as HTMLElement).style.transform = "";
    };
    document.querySelectorAll("button").forEach((btn) => {
      btn.addEventListener("mousedown", handleMouseDown);
      btn.addEventListener("mouseup", handleMouseUp);
    });

    return () => {
      observerRef.current?.disconnect();
      window.removeEventListener("scroll", handleScroll);
      document.querySelectorAll("button").forEach((btn) => {
        btn.removeEventListener("mousedown", handleMouseDown);
        btn.removeEventListener("mouseup", handleMouseUp);
      });
    };
  }, []);

  return (
    <main className="relative">
      {/* Decorative floating icons */}
      <img
        alt=""
        className="floating-shape w-32 top-40 -left-12 rotate-12 hidden lg:block"
        src="https://lh3.googleusercontent.com/aida-public/AB6AXuAuMQub7KXxO5Fq-VJc5NlkarEShlO8MMqLRntAjASz_wPcn-ApkPR6vVCsR91Ium5MP1_PwN9LnyK9HQJmQSsOxTMY6Quq9BmAuyinMyrHFRE9RkT8v5WFKFrMdp41uWPoCuFU1VbVahvMhQKGvL-t0_XHxC0nF23qJY1kQLQX5hf09sG8hA_i6HgJ5m4tC5BkkmZ068ZgfUC4M7nmfYEIo-yBW3GlFsfd2q0bTGs8expNbmwcPInguVqz3QMyeb3sslG0a2Gtc-dC"
      />
      <img
        alt=""
        className="floating-shape w-48 bottom-1/4 -right-12 -rotate-12 hidden lg:block"
        src="https://lh3.googleusercontent.com/aida-public/AB6AXuDhjpy-anBtY4X3JpF--nFz3GYG3sJRsyJZVw8GrHrpzK5bOFoGYgKj7MA-og1vp9IXNO3gyo7kPMWs89enP_0-ZaXQwPqfIw90sb2zun9O_aFa4qt1FA2A_lRTJ9KmDIWJ2ET6IFwxewvFss434mcOaU_E59zZcNrVGNzNYHJz2wy4BKhLTN6Ik-P4UGODLP2-VhhOzZoWTyVxqhUO_uYb6KgKaz4Tq9ZeJWWutLso1_pEpfvPfi9OGezQwVzmlqYWTzsk03_JKM3f"
      />

      {/* Hero Section */}
      <section className="relative pt-32 pb-16 md:pt-48 md:pb-32 px-margin-mobile md:px-margin-desktop max-w-7xl mx-auto">
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-12">
          <div className="w-full md:w-2/3 reveal active">
            <div className="inline-flex items-center gap-2 mb-4">
              <img
                alt="icon"
                className="w-8 h-8 opacity-80"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAuMQub7KXxO5Fq-VJc5NlkarEShlO8MMqLRntAjASz_wPcn-ApkPR6vVCsR91Ium5MP1_PwN9LnyK9HQJmQSsOxTMY6Quq9BmAuyinMyrHFRE9RkT8v5WFKFrMdp41uWPoCuFU1VbVahvMhQKGvL-t0_XHxC0nF23qJY1kQLQX5hf09sG8hA_i6HgJ5m4tC5BkkmZ068ZgfUC4M7nmfYEIo-yBW3GlFsfd2q0bTGs8expNbmwcPInguVqz3QMyeb3sslG0a2Gtc-dC"
              />
              <span className="text-accent-terracotta font-bold uppercase tracking-widest text-xs">
                Fresh Daily Vibes
              </span>
            </div>
            <h1 className="font-display-xl text-display-xl-mobile md:text-display-xl leading-none text-primary mb-6">
              Bake it 'til you <br />
              <span className="text-stroke">make it.</span>
            </h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-md">
              Freshly baked aesthetic for your daily vibe. Handcrafted pastries that look as good as they taste and feel like a warm hug.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4">
              <button className="bg-accent-terracotta text-white px-10 py-5 rounded-full font-black text-lg shadow-xl hover:bg-accent-terracotta/90 hover:scale-105 transition-all duration-300 flex items-center justify-center gap-3">
                Pre-order Now
                <span className="material-symbols-outlined">shopping_bag</span>
              </button>
              <button className="bg-primary/5 text-primary border-2 border-primary/10 px-8 py-5 rounded-full font-bold hover:bg-primary hover:text-on-primary transition-all duration-300">
                See the Menu
              </button>
            </div>
          </div>
          <div className="w-full md:w-1/2 relative mt-overlap-md md:mt-0">
            <div className="relative z-20 transform md:rotate-3 hover:rotate-0 transition-transform duration-500">
              <img
                alt="Aesthetic Cupcake"
                className="rounded-2xl shadow-2xl w-full h-[550px] object-cover border-8 border-white"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDOq0yR2CQZW_i4q24xt87JL36LFUsnsnlNWZAsxOU8Z6xMXGU-mq0D-lTBIRZVaSZyVqPfiXU4I1dU7vKChxcy59nhjkYWfoDkwXNx6ikAOA5yku1_7lq6uuCYk1zuOgbDwpyRbWPrMwPTDbE0454Cqg9Ty694rbbErHHE2ZM23Rbcksk5uVj27fykD1Sm1FpztGYEEB5CMRlBaRTn83XkgMu4JP4t7U5K9a3AjHHA_4V78ZPYv6Tn5QI95svwTKoCyLK9EcBF8j6v"
              />
            </div>
            <div className="absolute -bottom-6 -left-6 z-30 hidden md:block">
              <div className="glass-card p-6 rounded-2xl shadow-xl border-white/60 text-center transform -rotate-6">
                <img
                  alt="cute icon"
                  className="w-16 mx-auto mb-2"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDhjpy-anBtY4X3JpF--nFz3GYG3sJRsyJZVw8GrHrpzK5bOFoGYgKj7MA-og1vp9IXNO3gyo7kPMWs89enP_0-ZaXQwPqfIw90sb2zun9O_aFa4qt1FA2A_lRTJ9KmDIWJ2ET6IFwxewvFss434mcOaU_E59zZcNrVGNzNYHJz2wy4BKhLTN6Ik-P4UGODLP2-VhhOzZoWTyVxqhUO_uYb6KgKaz4Tq9ZeJWWutLso1_pEpfvPfi9OGezQwVzmlqYWTzsk03_JKM3f"
                />
                <span className="font-label-caps text-label-caps text-accent-terracotta block mb-1 uppercase">
                  Today's Batch
                </span>
                <p className="font-display-xl text-headline-lg-mobile text-primary">
                  100% Love
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-24 bg-surface-container-low relative overflow-hidden" id="vibe">
        {/* Playful circles background */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent-gold/10 rounded-full blur-3xl -mr-32 -mt-32" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent-terracotta/5 rounded-full blur-3xl -ml-48 -mb-48" />
        <div className="px-margin-mobile md:px-margin-desktop max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div className="reveal active">
              <div className="flex items-center gap-3 mb-2">
                <img
                  alt=""
                  className="w-6 h-6 rotate-12"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAuMQub7KXxO5Fq-VJc5NlkarEShlO8MMqLRntAjASz_wPcn-ApkPR6vVCsR91Ium5MP1_PwN9LnyK9HQJmQSsOxTMY6Quq9BmAuyinMyrHFRE9RkT8v5WFKFrMdp41uWPoCuFU1VbVahvMhQKGvL-t0_XHxC0nF23qJY1kQLQX5hf09sG8hA_i6HgJ5m4tC5BkkmZ068ZgfUC4M7nmfYEIo-yBW3GlFsfd2q0bTGs8expNbmwcPInguVqz3QMyeb3sslG0a2Gtc-dC"
                />
                <span className="font-label-caps text-label-caps text-accent-terracotta uppercase tracking-widest font-bold">
                  The Curated List
                </span>
              </div>
              <h2 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-primary">
                The Sweetest Pre-orders
              </h2>
            </div>
            <div className="reveal active">
              <a className="font-bold text-primary flex items-center gap-2 group" href="/menu">
                Explore All Treats
                <span className="material-symbols-outlined group-hover:translate-x-2 transition-transform">arrow_forward</span>
              </a>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Matcha Croissant */}
            <div className="reveal group active">
              <div className="relative overflow-hidden rounded-3xl bg-white transition-all duration-500 hover:-translate-y-3 shadow-lg hover:shadow-2xl">
                <span className="absolute top-4 left-4 z-10 bg-accent-gold text-primary px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-tighter shadow-sm">
                  Bestseller ✨
                </span>
                <div className="aspect-[4/5] overflow-hidden">
                  <img
                    alt="Matcha Croissant"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCF8rrH915m7dhERy2QKAS88P-O7SCWBEICAFytMsUifgTdynCE5qNLrLyhtiE3GxYiVUaUCejdiWlqso66xUMLndA0nU9X8OxQjtgu3SPTaPTOLbIlWr3k1s0H5VBAv80fKhlKtKNHQmZCq3CnGXzzUxoRCQZiso8_ijla-jT9F3mJN4kLRNTO7DPywimSSKaYtN_1YLd-rO3rLqcmg_NOWPqC77Tpc4tmgQHn9Ddguc3m8Da389HQu_LbxA3wWDFcH9EU3EmoeO2u"
                  />
                </div>
                <div className="p-8">
                  <h3 className="font-display-xl text-3xl text-primary mb-2">Matcha Croissant</h3>
                  <p className="text-on-surface-variant font-body-sm leading-relaxed">Pure ceremonial grade matcha, flaky layers of perfection.</p>
                  <div className="mt-6 flex justify-between items-center">
                    <span className="text-2xl font-black text-primary">$6.50</span>
                    <button className="w-12 h-12 rounded-full bg-accent-terracotta text-white flex items-center justify-center hover:scale-110 transition-transform shadow-lg">
                      <span className="material-symbols-outlined">add</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Strawberry Cloud */}
            <div className="reveal group md:mt-12 active">
              <div className="relative overflow-hidden rounded-3xl bg-white transition-all duration-500 hover:-translate-y-3 shadow-lg hover:shadow-2xl">
                <span className="absolute top-4 left-4 z-10 bg-accent-terracotta text-white px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-tighter shadow-sm">
                  Vibe of the Week 🍓
                </span>
                <div className="aspect-[4/5] overflow-hidden">
                  <img
                    alt="Strawberry Cloud Cake"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCdG7SsOz-1PF4uMs2s_lB4y3M2h80sbtzn6cXzLdTf1UuAV0EWJvFjBsRBhXdt7l1qxyql-l4b9YaQCSQjIQn-Zzfm3EUZ5Qkg7BYuONV7gw6MEn0tOy5_J6DpAvP--34xOBzAYVnvZHH_OHL59TbNU7cRGPmxIotV7jFw4Gw7W-bfdot0-8O3hlrmJjA-yy1XIxoPosXcgo8cfVCr2XTfout12OYH42X_JPVY94V_94hNYEz8De-tyLrdvJhkVHzqbQw5bf6aeifW"
                  />
                </div>
                <div className="p-8">
                  <h3 className="font-display-xl text-3xl text-primary mb-2">Strawberry Cloud</h3>
                  <p className="text-on-surface-variant font-body-sm leading-relaxed">Light as air sponge cake with fresh garden berries.</p>
                  <div className="mt-6 flex justify-between items-center">
                    <span className="text-2xl font-black text-primary">$8.00</span>
                    <button className="w-12 h-12 rounded-full bg-accent-terracotta text-white flex items-center justify-center hover:scale-110 transition-transform shadow-lg">
                      <span className="material-symbols-outlined">add</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Iced Vanilla Latte */}
            <div className="reveal group active">
              <div className="relative overflow-hidden rounded-3xl bg-white transition-all duration-500 hover:-translate-y-3 shadow-lg hover:shadow-2xl">
                <div className="aspect-[4/5] overflow-hidden">
                  <img
                    alt="Iced Vanilla Latte"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBDL8xVHLcZGTz96KSs5CWcBN7JXatG1IaY12Sg5B24TMjFkUNns5uEupGjcx9tfnP3xSzOJprObdp5OH18RLIaFgaXu-FwbF7iGfOkArTnA4ecXbET7W1RLzUY4aQX0_7mjgy9ADZkQ0U4Bi6c8I0jLRKaVR__K9j3aRQlcd9Uq31zUn6kkmvKRrcf1JPF8opwfjyF0p88wEt8fBkFlaBW_u4GXOmrXarMTFTFeOHUZHMJPgAVlN9oCx67sdfufPNCvs77c3aBELgo"
                  />
                </div>
                <div className="p-8">
                  <h3 className="font-display-xl text-3xl text-primary mb-2">Iced Vanilla Latte</h3>
                  <p className="text-on-surface-variant font-body-sm leading-relaxed">Smooth cold brew, house-made vanilla, silky oat milk.</p>
                  <div className="mt-6 flex justify-between items-center">
                    <span className="text-2xl font-black text-primary">$5.75</span>
                    <button className="w-12 h-12 rounded-full bg-accent-terracotta text-white flex items-center justify-center hover:scale-110 transition-transform shadow-lg">
                      <span className="material-symbols-outlined">add</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About / Process Section */}
      <section className="py-24 px-margin-mobile md:px-margin-desktop max-w-7xl mx-auto overflow-hidden" id="process">
        <div className="flex flex-col md:flex-row gap-16 items-center">
          <div className="w-full md:w-1/2 grid grid-cols-2 gap-6 relative">
            <div className="space-y-6 mt-12 reveal active">
              <img
                alt="Kneading Dough"
                className="rounded-2xl w-full h-64 object-cover shadow-lg transform -rotate-2"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuChUR3oRJhNPe8_SyHz07VoV5p2OWeTLEvFWA_AA4rrORRxF0LeiTfDhxFTfpk3g_EISIB-jnV6NwV4v7QtIBc018V6C0kj0tJttZMjRPgSgm9mjYnD5Uw9G0A7M6rHkAJ-6uG3FZbb3eIptFkM2uWo-SFR_mLko4hG7frB6_i4kMCAAh0FUnnA4qPXxUwwmzvN4MCgqYBKgSvUQ8L3Wsf87xlZaJFAz4nLdMqtCH7RL4hwPBb4XsXUVtQ87sfjq25qegkWjG8yeXlM"
              />
              <img
                alt="Oven Fresh"
                className="rounded-2xl w-full h-80 object-cover shadow-lg transform rotate-1"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAOQ00CvYbhSqhZ8XaeWrs7GRMEkUve1vMUo_jiEQHj8vbjCxCWXf529t5hr7pYTnI4DFRxxrjQcn4n8pA6au-DFsouEpgFlQBAlqMSUsRVROSyPpzGdHtF0_xngePJLd2LCkbCDHhvj9aLT1BiqQpbwhOLdxoR1HeoxnQTfhJ9J5fyEvKxUvlxTK9swgbCKzo0AwjcmPTz7QrtOdEsROujXRpjAxqqu1Ya2Y9eJXfrjzGeE15W3PtjsxBUa9z3QmqzAiSsViLBlbhk"
              />
            </div>
            <div className="space-y-6 reveal active">
              <img
                alt="Flour Detail"
                className="rounded-2xl w-full h-80 object-cover shadow-lg transform rotate-2"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuA4j2OF9JVgRRBVqKDVNtc07ZJV_gIUelzNZnDoNWHxOHqhGbznGuI_EVMlho_p4RPlGT917FDdaizMtGdGlB5L2S-yes9PdG8n2PBR6Fnn7zKuPzKzTaaJgKgiZmubLDiHjjfBYeEcKVJs7chYal1FeFD6WWD6RkAosFKI4j8LqhPeqFrsxSdYwwTxHTO_eq_WJaEViUAJALxYkROgi3sNo9P6M2MdpKYlHPSjofFJs6UxzqE-5Iq1QDaufcH9W2ZbQYWOBaNmPinL"
              />
              <img
                alt="Finished Pastry"
                className="rounded-2xl w-full h-64 object-cover shadow-lg transform -rotate-1"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBUzDgEBMmTB1nZAiXRXLPDhsM8VM3v5PhI24ZaWtFchu8xDI_Csktz-4Znp5lcHjz7-41h21hyPZ4mg26MFQm11FOoBr0ihLBWf0_haT9P3uW-A_28NTL3NnJXaGcZyjzibjayiCfQJXV5w3VvIi0pR9BQtevS9tnu77ToPXwdvBtmH_Fo4nbmZhz1P0yOubW0zwmUNuuYaaBp_Bt04X5fGdMwi_cBXTyl2IkDuC62knx-CBXjv_xh-hFgbk3kpBhZqc-GAVAuOEQc"
              />
            </div>
            {/* Decorative Icon in grid */}
            <div className="absolute -top-10 -right-10 w-24 h-24 hidden lg:block reveal active">
              <img
                alt="cute icons"
                className="w-full rotate-45 animate-pulse"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAuMQub7KXxO5Fq-VJc5NlkarEShlO8MMqLRntAjASz_wPcn-ApkPR6vVCsR91Ium5MP1_PwN9LnyK9HQJmQSsOxTMY6Quq9BmAuyinMyrHFRE9RkT8v5WFKFrMdp41uWPoCuFU1VbVahvMhQKGvL-t0_XHxC0nF23qJY1kQLQX5hf09sG8hA_i6HgJ5m4tC5BkkmZ068ZgfUC4M7nmfYEIo-yBW3GlFsfd2q0bTGs8expNbmwcPInguVqz3QMyeb3sslG0a2Gtc-dC"
              />
            </div>
          </div>
          <div className="w-full md:w-1/2 reveal active">
            <span className="font-label-caps text-label-caps text-accent-terracotta uppercase tracking-widest font-bold">
              Our DNA
            </span>
            <h2 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-primary mt-4 mb-8">
              Bakery Goals
            </h2>
            <div className="space-y-8 font-body-lg text-body-lg text-on-surface-variant">
              <p>
                We don't do boring. Every single treat at Navisha is handcrafted daily with a sprinkle of magic and a lot of aesthetic energy.
              </p>
              <div className="p-8 bg-white/60 rounded-3xl border border-white/80 shadow-sm relative overflow-hidden">
                <img
                  alt=""
                  className="absolute -bottom-4 -right-4 w-24 opacity-20 rotate-12"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDhjpy-anBtY4X3JpF--nFz3GYG3sJRsyJZVw8GrHrpzK5bOFoGYgKj7MA-og1vp9IXNO3gyo7kPMWs89enP_0-ZaXQwPqfIw90sb2zun9O_aFa4qt1FA2A_lRTJ9KmDIWJ2ET6IFwxewvFss434mcOaU_E59zZcNrVGNzNYHJz2wy4BKhLTN6Ik-P4UGODLP2-VhhOzZoWTyVxqhUO_uYb6KgKaz4Tq9ZeJWWutLso1_pEpfvPfi9OGezQwVzmlqYWTzsk03_JKM3f"
                />
                <p className="font-bold text-primary italic text-xl leading-relaxed relative z-10">
                  "It's not just about the crumb; it's about the content. We bake for the ones who curate their life like a masterpiece."
                </p>
              </div>
              <div className="flex flex-wrap gap-8 mt-12 justify-between">
                <div className="text-center sm:text-left">
                  <p className="font-display-xl text-5xl text-accent-terracotta">0%</p>
                  <p className="text-xs font-black uppercase tracking-widest opacity-60">Artificial Junk</p>
                </div>
                <div className="text-center sm:text-left">
                  <p className="font-display-xl text-5xl text-accent-gold">24h</p>
                  <p className="text-xs font-black uppercase tracking-widest opacity-60">Happy Rise</p>
                </div>
                <div className="text-center sm:text-left">
                  <p className="font-display-xl text-5xl text-primary">100</p>
                  <p className="text-xs font-black uppercase tracking-widest opacity-60">Daily Energy</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Location Section */}
      <section className="py-24 bg-primary text-on-primary relative overflow-hidden" id="catch-us">
        <div className="px-margin-mobile md:px-margin-desktop max-w-7xl mx-auto flex flex-col md:flex-row gap-16 relative z-10">
          <div className="w-full md:w-1/3 reveal active">
            <h2 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg mb-8 leading-tight">
              Find Us <br /> On the Daily.
            </h2>
            <div className="bg-white/10 backdrop-blur-md p-8 rounded-3xl border border-white/20">
              <div className="flex items-center gap-4 mb-6">
                <span className="w-3 h-3 bg-accent-gold rounded-full animate-pulse shadow-[0_0_10px_#d4af37]" />
                <p className="font-label-caps text-label-caps text-white/80 uppercase">Now Open</p>
              </div>
              <p className="font-display-xl text-4xl mb-2">07:00 — 20:00</p>
              <p className="font-body-lg opacity-60 mb-8">Serving fresh vibes daily</p>
              <hr className="border-white/10 mb-8" />
              <p className="font-body-sm opacity-50 uppercase tracking-widest mb-2 text-xs font-bold">The Spot</p>
              <p className="font-body-lg">124 Baker's Row, Creative District <br />NY 10012</p>
              <button className="w-full mt-10 bg-accent-gold text-primary py-4 rounded-full font-black text-lg hover:scale-105 transition-transform shadow-xl">
                Get Directions
              </button>
            </div>
          </div>
          <div className="w-full md:w-2/3 reveal group relative active">
            <div className="h-[550px] rounded-[2rem] overflow-hidden shadow-2xl grayscale hover:grayscale-0 transition-all duration-1000 border-4 border-white/10">
              <img
                alt="Map"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[2000ms]"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDjeLeHqKUJXkrXOH2xyT5L5dIMZdVQlLY1Mgm0NlxVqTuwV7Fe19SgOFlkfIqXNNNAToaPNL8XhUV6NTW6hOl7JDQaPibz_eX6e-Lo7uQlURBVeBUusmRf_TkUWgTZia49s0llzsHuue6tosFBvDAcZsDdm46d7tsJcv-0yLMJebStoRr9nJzVW0rMnkft_p8etPeMxhj9ZnWS4eRjaXKEtliz6rAd8wwh6yhxFR2JyMk6lyJrKAEDJSlZoTr15uE7J4ndwbLiFHTO"
              />
            </div>
            {/* Playful overlay icons on map */}
            <div className="absolute top-10 left-10 p-4 bg-white rounded-2xl shadow-xl reveal group-hover:rotate-0 -rotate-3 transition-transform active">
              <img
                alt=""
                className="w-12 h-12"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDhjpy-anBtY4X3JpF--nFz3GYG3sJRsyJZVw8GrHrpzK5bOFoGYgKj7MA-og1vp9IXNO3gyo7kPMWs89enP_0-ZaXQwPqfIw90sb2zun9O_aFa4qt1FA2A_lRTJ9KmDIWJ2ET6IFwxewvFss434mcOaU_E59zZcNrVGNzNYHJz2wy4BKhLTN6Ik-P4UGODLP2-VhhOzZoWTyVxqhUO_uYb6KgKaz4Tq9ZeJWWutLso1_pEpfvPfi9OGezQwVzmlqYWTzsk03_JKM3f"
              />
            </div>
          </div>
        </div>
        {/* Light background pattern for dark section */}
        <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
          <svg height="100%" width="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern height="40" id="dots" patternUnits="userSpaceOnUse" width="40">
                <circle cx="2" cy="2" fill="white" r="2" />
              </pattern>
            </defs>
            <rect fill="url(#dots)" height="100%" width="100%" />
          </svg>
        </div>
      </section>

      {/* Bottom CTA Section */}
      <section className="py-24 px-margin-mobile md:px-margin-desktop bg-surface-container">
        <div className="max-w-4xl mx-auto text-center reveal active">
          <img
            alt="Happy bakery"
            className="w-40 mx-auto mb-8 animate-bounce"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDhjpy-anBtY4X3JpF--nFz3GYG3sJRsyJZVw8GrHrpzK5bOFoGYgKj7MA-og1vp9IXNO3gyo7kPMWs89enP_0-ZaXQwPqfIw90sb2zun9O_aFa4qt1FA2A_lRTJ9KmDIWJ2ET6IFwxewvFss434mcOaU_E59zZcNrVGNzNYHJz2wy4BKhLTN6Ik-P4UGODLP2-VhhOzZoWTyVxqhUO_uYb6KgKaz4Tq9ZeJWWutLso1_pEpfvPfi9OGezQwVzmlqYWTzsk03_JKM3f"
          />
          <h2 className="font-display-xl text-display-xl-mobile md:text-6xl text-primary mb-8">
            Ready for the Vibe?
          </h2>
          <p className="text-on-surface-variant text-xl mb-12 max-w-xl mx-auto">
            Skip the line and grab your aesthetic treats before they're gone. Fresh batches every morning!
          </p>
          <button className="bg-accent-terracotta text-white px-16 py-6 rounded-full font-black text-2xl shadow-2xl hover:bg-accent-terracotta/90 hover:scale-105 active:scale-95 transition-all duration-300">
            Pre-order Now
          </button>
        </div>
      </section>
    </main>
  );
}