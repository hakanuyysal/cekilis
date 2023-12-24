// App.js
import React, { useEffect, useState } from "react";
import "./Main.css";
import "font-awesome/css/font-awesome.min.css";
import axios from "axios";
import Swal from "sweetalert2";

const Main = () => {
  const participant = () => {
    const team = localStorage.getItem("participants");
    return team ? JSON.parse(localStorage.getItem("participants")) : null;
  };
  // const AddURL = process.env.REACT_APP_ADD_USER_URL;
  const [name, setName] = useState("");
  const [team, setTeam] = useState("");
  const [participants, setParticipants] = useState(participant);
  const [teamParticipants, setTeamParticipants] = useState([]);
  const [eslesmeler, setEslesmeler] = useState([]);
  const [matchedUser, setMatchedUser] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (event) => {
    setTeam(event.target.value);
    // Her takım adı değiştikçe hata mesajını temizle
    setErrorMessage("");
  };

  // Sayfa yenilendiğinde localStorage'e veri yaz
  useEffect(() => {
    localStorage.setItem("participants", JSON.stringify(participants));
  }, [participants]);

  // Sayfa yüklendiğinde localStorage'den veri çek
  useEffect(() => {
    const storedParticipants =
      JSON.parse(localStorage.getItem("participants")) || [];
    setParticipants(storedParticipants);
  }, []);
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Önce aynı isimde bir katılımcının olup olmadığını kontrol et
    const existingParticipant = participants.find(
      (participant) => participant.name === name
    );

    if (existingParticipant) {
      alert("Bu isimde bir katılımcı zaten var.");
      return;
    }

    try {
      const userData = {
        name: name.trim(),
        team: team.trim(),
      };

      const response = await axios.post(
        "http://localhost:5000/api/raffleEntry/add-user",
        userData
      );

      setParticipants((prevParticipants) => [
        ...prevParticipants,
        response.data,
      ]);
      // console.log("Eklenen kullanıcı:", response.data);
      setName("");
      // setTeam("");
    } catch (error) {
      console.error("Hata:", error.message);
      alert(
        "Aynı isimle kayıtlı katılımcı mevcut. Lütfen farklı bir katılımcı deneyin."
      );
    }
  };
  const handleClearParticipant = async (name) => {
    try {
      const response = await axios.delete(
        `http://localhost:5000/api/raffleEntry/delete-user/${name}`
      );
      // console.log(response);
      if (response.status === 200) {
        // Başarıyla silindiğinde local state'i güncelle
        const updatedParticipants = participants.filter(
          (participant) => participant.name !== name
        );
        setParticipants(updatedParticipants);
      } else {
        console.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleClearParticipants = async () => {
    try {
      const response = await axios.delete(
        "http://localhost:5000/api/raffleEntry/delete-all-users"
      );
      // console.log(response.data);
      if (response) {
        setParticipants([]);
        setTeamParticipants([]);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleMatchUsers = async (team) => {
    // console.log(team);
    if (team) {
      try {
        const response = await axios.get(
          `http://localhost:5000/api/raffleEntry/match-users/${team}`
        );

        if (response.data.success) {
          setMatchedUser(seeRaffleMatch);
          setParticipants([]);
          // setTeamParticipants([])
          // handleClearParticipants();
        } else {
          console.error(response.data.message);
        }
      } catch (error) {
        console.error(
          "Ekipler arasında eşleşme yapılırken bir hata oluştu",
          error
        );
      }
    } else {
      alert("Çekiliş için yeterli katılımcı mevcut değildi!");
    }
  };

  const seeRaffleMatch = () => {
    Swal.fire({
      title:
        "Eşleşme tamalandı, çekiliş sonucunu gör butonundan sana kimin çıktığını öğrenebilirsin!",
      showClass: {
        popup: `
          animate__animated
          animate__fadeInUp
          animate__faster
        `,
      },
      hideClass: {
        popup: `
          animate__animated
          animate__fadeOutDown
          animate__faster
        `,
      },
    });
  };

  const showHandleRaffle = async ({ team, name }) => {
    try {
      const endpointURL = `http://localhost:5000/api/raffleEntry/match-users/${team}/${name}`;
      // console.log(endpointURL);
      const response = await axios.get(endpointURL);
      if (response) {
        setEslesmeler(response.data.matchedUser.name);
      } else {
        alert(
          "Herhangi bir kişi bulunamamıştır! Takım adını ve katılımcın adını kontrol ediniz"
        );
      }
      // setTeam("");
      // setName("");
      // Endpoint'ten gelen verileri kullanma
    } catch (error) {
      console.error("Hata:", error);
      alert(
        "Herhangi bir kişi bulunamamıştır! Takım adını ve katılımcın adını kontrol ediniz"
      );
    }
  };

  const handleShowparticipants = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/raffleEntry/get-teams/${team}`
      );
      // const team = response.data.team;
      console.log(response.data.team.members.length);
      if (response.data.team.members.length > 0) {
        setTeamParticipants(response.data.team.members);
        // console.log(teamParticipants);
      } else {
        setTeamParticipants([]);
        setErrorMessage("Bu takımda katılımcı bulunmamaktadır.");
      }
    } catch (error) {
      console.error("Error fetching team members", error);
      alert("Takım ismini kontrol ediniz!");
    }
  };
  return (
    <div>
      <header>
        <img className="logo" src="aa.png" alt="Logo" />
        <h1>Yılbaşı Çekilişi</h1>
      </header>
      <div className="flex-container">
        {/* Katılımcı Ekle Kısmı */}
        <div className="flex-item1">
          <form onSubmit={handleSubmit}>
            <label>
              Takım Adı:
              <input
                type="text"
                value={team}
                className="form-control mt-3"
                onChange={handleChange}
              />
            </label>
            <br />
            <label className="mt-3">
              Katılımcı Adı:
              <input
                type="text"
                value={name}
                class="form-control mt-3"
                onChange={(e) => setName(e.target.value)}
              />
            </label>
            <br />
            <button type="submit" className="mt-3">
              Katılımcı Ekle
            </button>
          </form>
          <button onClick={handleShowparticipants} className="mt-3">
            Takımdaki katılımcıları Gör
          </button>
        </div>

        {/* Diğer İçerikler */}
        <div className="flex-item2" id="participants">
          <h3 className="mt-4">Katılımcı Listesi</h3>
          <div className="flex-item2-container">
            {participants <= 0 ? (
              <p></p>
            ) : (
              <table>
                <tbody>
                  <ul>
                    {participants.map((participant, index) => (
                      <li key={index}>
                        {participant.name}
                        <i
                          style={{ color: "white" }}
                          className="fas fa-trash-alt sil "
                          onClick={() =>
                            handleClearParticipant(participant.name)
                          }
                        />
                      </li>
                    ))}
                  </ul>
                </tbody>
              </table>
            )}
            {participants.length > 0 && (
              <button className="silk" onClick={handleClearParticipants}>
                Listeyi Temizle
              </button>
            )}
          </div>
        </div>

        <div className="flex-item3">
          {participants.length > 2 ? (
            <button
              className="cek"
              onClick={() => handleMatchUsers(participants[0].team)}
            >
              Çekiliş Yap
            </button>
          ) : (
            <p className="alert alert-danger">
              Çekiliş için en az 3 katılımcı olması gerekmektedir!
            </p>
          )}

          <div id="modal" className="mt-3">
            <div className="flex-item2-container ">
              {/* Button trigger modal */}
              <button
                type="button"
                className="btn modalBtn"
                data-bs-toggle="modal"
                data-bs-target="#staticBackdrop"
              >
                Çekiliş Sonucunu Gör
              </button>
              {/* Modal */}
              <div
                className="modal fade"
                id="staticBackdrop"
                data-bs-backdrop="static"
                data-bs-keyboard="false"
                tabIndex={-1}
                aria-labelledby="staticBackdropLabel"
                aria-hidden="true"
              >
                <div className="modal-dialog modal-dialog-centered">
                  <div className="modal-content">
                    <div className="modal-header">
                      <h1 className="modal-title fs-5" id="staticBackdropLabel">
                        Modal title
                      </h1>
                      <button
                        type="button"
                        className="btn-close"
                        data-bs-dismiss="modal"
                        aria-label="Close"
                      />
                    </div>
                    <div className="modal-body">
                      <label className="">
                        <p className="text-dark">Takım Adı:</p>
                        <input
                          type="text"
                          value={team}
                          className="form-control"
                          onChange={(e) => setTeam(e.target.value)}
                        />
                      </label>
                      <br />
                      <label>
                        <p className="text-dark mt-1">Katılımcı Adı:</p>

                        <input
                          type="text"
                          value={name}
                          className="form-control"
                          onChange={(e) => setName(e.target.value)}
                        />
                      </label>
                      <br />

                      <button
                        className="mt-3"
                        onClick={() => showHandleRaffle({ team, name })}
                      >
                        Sonucu Gör
                      </button>
                    </div>
                    <div id="modal-footer" className="modal-footer ">
                      {eslesmeler ? (
                        <p className="text-dark text-center">
                          Hediye alacağınız kişi: {eslesmeler}
                        </p>
                      ) : (
                        <p className="text-danger">
                          Herhangi bir kişi bulunamamıştır! Takım adını ve
                          katılımcın adını kontrol ediniz
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {teamParticipants.length <= 0 ? (
          <div className="flex-item4">
            <p className="mt-4">
              Takımınızdaki katılımcıları görmek için takım adını yazdıktan
              sonra takımdaki katılımcıları gör butonuna tıklayabilirsiniz...
            </p>
            {errorMessage && (
              <p className="alert alert-danger">{errorMessage}</p>
            )}
          </div>
        ) : (
          <div className="flex-item4">
            <h3 className="mt-3">Takım Listesi</h3>
            <table>
              <tbody>
                <ul>
                  {teamParticipants.map((katilimci) => (
                    <li key={katilimci._id}>
                      {katilimci.name}
                      <i
                        style={{ color: "white" }}
                        className="fas fa-trash-alt sil "
                        onClick={() => handleClearParticipant(participant.name)}
                      />
                    </li>
                  ))}
                </ul>
              </tbody>
            </table>
            {teamParticipants.length > 0 && (
              <button className="silk" onClick={handleClearParticipants}>
                Listeyi Temizle
              </button>
            )}
          </div>
        )}
      </div>
      <br />
    </div>
  );
};

export default Main;
