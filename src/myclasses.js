class config {
  name    = "Rotator 1"        // rotator name
  address = "localhost"        // ROTCTLD FQDN or ip address - default: localhost 
  port    = 4533               // ROTCTLD listen port - default: 4533
  polling = 300                // Polling rate for position (ms) - default 300 ms
  error   = 5                  // minimum difference to start rotation 
  stop    = 180                // Rotator has south (180) or north (0) stop - default 180.
  file    = "default.json"     // configuration file name
  path    = ""                 // configuration path
  moveTo  = false              // Rotator support "P" command.  i.e. Rotator support a "point to " manage hitself
};                             // If true, than rotctld will simply tell to Rotator "move to XXX degree" and all 
                               // required operation will be handled by rotator/rotctld themselves
                               // If false, then rotctlGUI will turn motor CW or CCW until it reach required
                               // destination. Leave it to false in doubt.   

  
class protocolStatus {
  sent         = []            // list of sent commands (FIFO)                     
  rxBuffer     = ""            // Received data from rotCTLD
  target       = null          // Target value requested from GUI (0 ... 360)
  azimuth      = null          // current azimuth (0 ... 360)
  motor        = "S"           // Motor status
  connected    = false         // turn to true after verify connection
  errors       = 0             // Communication error
}

// Export classes
module.exports = {config,protocolStatus };