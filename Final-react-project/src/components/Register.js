import "./Auth.css";
import UserRegisterForm from "./UserRegisterForm";

function Register() {

  return (
    <div className="landing-wrapper">
      <div className="register-container">
        <h2>Register</h2>
          <UserRegisterForm/> 
      </div>
    </div>
  );
}

export default Register;
