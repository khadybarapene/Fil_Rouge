import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import Dossier from './components/Dossier';
import AjouterProjet from './components/AjouterProjet';
import { addProjet, getProjets } from './api';
import './App.css';


// =============================
// ACCUEIL
// =============================
const Accueil = ({ onNavigateProjets }) => {
  const [stats, setStats] = useState({
    projets: 0,
    technologies: 0
  });

  useEffect(() => {
    getProjets()
      .then(res => {
        const projets = res.data;

        const toutesLesTechs = new Set(
          projets
            .flatMap(p => p.technologies || [])
            .map(t => t.trim().toLowerCase())
        );

        setStats({
          projets: projets.length,
          technologies: toutesLesTechs.size
        });
      })
      .catch(() => {});
  }, []);


  return (
    <div className="accueil">

      <div className="hero">

        <div className="hero-content">

          <div className="hero-text">

            <p className="hero-label">
              Portfolio 2026
            </p>


            <h1 className="hero-title">

              <span className="gradient-text">
                Créer.
              </span>

              <span className="accent-text">
                Innover.
              </span>

              <span className="muted-text">
                Livrer.
              </span>

            </h1>


            <p className="hero-sub">
              Développeuse passionnée spécialisée en web,
              mobile et DevOps.
              Je transforme vos idées en expériences digitales.
            </p>


            <div className="hero-btns">

              <button
                className="btn-primary"
                onClick={onNavigateProjets}
              >
                Voir mes projets →
              </button>


              <a
                href="mailto:khadypene267@gmail.com"
                className="btn-ghost"
              >
                Me contacter
              </a>

            </div>

          </div>



          <div className="hero-avatar-block">

            <div className="hero-avatar">
              KP
            </div>


            <div className="hero-badge">

              <p className="hero-badge-count">
                {stats.projets}+ projets
              </p>


              <p className="hero-badge-label">
                réalisés
              </p>

            </div>

          </div>


        </div>

      </div>



      <div className="stats-bar">

        <div className="stats-inner">


          <div className="stat-item">
            <p className="stat-num accent">
              {stats.projets}+
            </p>
            <p className="stat-label">
              Projets réalisés
            </p>
          </div>



          <div className="stat-item">

            <p className="stat-num accent">
              {stats.technologies}+
            </p>

            <p className="stat-label">
              Technologies
            </p>

          </div>



          <div className="stat-item">

            <p className="stat-num gold">
              ∞
            </p>

            <p className="stat-label">
              Passion
            </p>

          </div>


        </div>

      </div>


      <div className="about-grid">


        <div className="card about-card">

          <div className="card-header">

            <div className="section-line"/>

            <h2 className="card-title">
              À propos de moi
            </h2>

          </div>


          <p className="card-text">

            Je suis une développeuse passionnée par
            le développement logiciel, le DevOps et
            la cybersécurité.

            J'aime concevoir des applications modernes
            et mettre en place des infrastructures
            sécurisées.

          </p>


        </div>



        <div className="card skills-card">


          <div className="card-header">

            <div className="section-line"/>

            <h2 className="card-title">
              Compétences
            </h2>

          </div>



          <div className="skills-list">

            {
              [
                'HTML',
                'CSS',
                'JavaScript',
                'React',
                'Node.js',
                'Docker',
                'AWS',
                'Kubernetes'
              ].map(skill => (

                <span
                  key={skill}
                  className="skill-badge"
                >
                  {skill}
                </span>

              ))
            }

          </div>


        </div>


      </div>


    </div>
  );
};



Accueil.propTypes = {
  onNavigateProjets:
    PropTypes.func.isRequired
};




// =============================
// CONTACT
// =============================
const Contact = ({ toast }) => {


  const [form,setForm] = useState({
    nom:'',
    email:'',
    sujet:'',
    message:''
  });



  const handleChange = e => {

    setForm({
      ...form,
      [e.target.name]:
      e.target.value
    });

  };



  const handleSubmit = e => {

    e.preventDefault();

    toast(
      "Message envoyé avec succès !",
      "success"
    );


    setForm({
      nom:'',
      email:'',
      sujet:'',
      message:''
    });

  };



  return (

    <div className="contact-section">


      <h2>
        Me contacter
      </h2>



      <form
        className="form-card"
        onSubmit={handleSubmit}
      >


        <input
          name="nom"
          placeholder="Nom"
          value={form.nom}
          onChange={handleChange}
        />



        <input
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
        />



        <input
          name="sujet"
          placeholder="Sujet"
          value={form.sujet}
          onChange={handleChange}
        />



        <textarea
          name="message"
          placeholder="Message"
          value={form.message}
          onChange={handleChange}
        />



        <button className="btn-primary">
          Envoyer
        </button>


      </form>


    </div>

  );

};


Contact.propTypes = {
  toast: PropTypes.func.isRequired
};




// =============================
// TOAST
// =============================
const Toast = ({msg,type,visible}) => (

<div className={`toast ${visible?'toast-visible':''}`}>

{msg}

</div>

);



Toast.propTypes={
 msg:PropTypes.string.isRequired,
 type:PropTypes.string.isRequired,
 visible:PropTypes.bool.isRequired
};




// =============================
// APP
// =============================

const TABS = [
  "Accueil",
  "Projets",
  "Ajouter",
  "Contact"
];



export default function App(){


const [activeTab,setActiveTab]
=
useState("Accueil");



const [toast,setToast]
=
useState({
 msg:'',
 type:'',
 visible:false
});



const [dossierKey,setDossierKey]
=
useState(0);




const showToast = useCallback(
(msg,type="success")=>{


setToast({
 msg,
 type,
 visible:true
});


setTimeout(()=>{

setToast(t=>({
...t,
visible:false
}));

},3000);


},[]);





const handleAjouterProjet =
async(data)=>{


try{


await addProjet(data);


showToast(
"Projet ajouté avec succès"
);


setDossierKey(k=>k+1);


setActiveTab("Projets");


}catch{


showToast(
"Erreur lors de l'ajout",
"error"
);


}


};




return (

<div className="app">



<header className="header">

<h2>
Khady PENE
</h2>


<nav>

{
TABS.map(tab=>(

<button

key={tab}

className={
activeTab===tab
?
"active"
:
""
}


onClick={()=>setActiveTab(tab)}

>

{tab}

</button>

))

}

</nav>


</header>





<Toast

msg={toast.msg}

type={toast.type}

visible={toast.visible}

/>






<main>



{
activeTab==="Accueil" &&

<Accueil
onNavigateProjets={
()=>setActiveTab("Projets")
}
/>

}





{
activeTab==="Projets" &&

<Dossier
key={dossierKey}
toast={showToast}
/>

}




{
activeTab==="Ajouter" &&

<AjouterProjet

onAjouter={
handleAjouterProjet
}

onCancel={
()=>setActiveTab("Projets")
}

/>

}





{
activeTab==="Contact" &&

<Contact
toast={showToast}
/>

}




</main>



<footer>

© 2026 Portfolio Khady PENE

</footer>



</div>

);


}