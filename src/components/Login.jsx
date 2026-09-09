import { useState } from "react";
import { supabase } from '../client'

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault(); 
        setLoading(true);
        setError('');

        const {error} = await supabase.auth.signInWithPassword({
            email: email, 
            password: password,
        });

        if (error) {
            setError(error.message);
        }
        else {
            alert('Login successful');
            // redirect user / update app state 
        }
        setLoading(false); 
    };


    return(
        <div className="login-box">
            <h2>Login to Your Account</h2>
            <form onSubmit={handleLogin}>
                {/* put login stuff here, ask for email and password */}
                {/* look into how to get login with google, oauth */}
            </form>
        </div>
    )
}

export default Login; 