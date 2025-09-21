import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import passport from 'passport';
import 'dotenv/config'
import User from '../models/User.js';

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL,
    scope: ['profile', 'email'],
},
    async function (accessToken, refreshToken, profile, done) {
        console.log(profile)
        try {
            const user = await User.findOneAndUpdate({ googleId: profile.id }, {
                $set: {
                    googleId: profile.id,
                    name: profile.displayName,
                    email: profile.emails[0].value,
                    avatar: {
                        url: profile.photos[0].value,
                        public_id: profile.photos[0].value,
                    },
                    loginMethod: 'google',
                    isEmailVerified: true,
                }
            })
            return done(null, user);
        } catch (error) {
            console.log(error)
            return done(error);
        }
    }
));

export default passport;
