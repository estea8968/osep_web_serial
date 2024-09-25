const ArgumentType = require("../../extension-support/argument-type");
const BlockType = require("../../extension-support/block-type");
const msg = require("./translation");
const formatMessage = require("format-message");
const sheetrock = require("sheetrock");
//add by estea
const ml5 = require('ml5');

const jQuery =require("./jquery.min.js");

//require("babel-polyfill");
//
const menuIconURI =
    "data:image/png;base64,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";
const blockIconURI =
    " data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAALgAAACvCAIAAADBgoOzAAAAA3NCSVQICAjb4U/gAAAAEHRFWHRTb2Z0d2FyZQBTaHV0dGVyY4LQCQAAG0hJREFUeNrtnXmQXFd973/nrn379j7dPd2z9eyrtaHFq/AChsQ2MnbALC/lhAJCSGUhjolxkZCCmLzHe5CFQAIhqTzyKnEgxSPGBiyCLINly9Y+0sgzmn3v6X1fbt8tf8iWRlLfvr3N9KL7rVOqmtLt26fP/dzf+f1+Z0OyLIMmTWrCtCbQpIGiSQNFkwaKJg0UTRoomjRQNGnSQNGkgaJJA0WTBoomDRRNDSvi5vmpAkBQhJAEARFCIgQliErAycDJkHv7X37T9SSAHQcHDnYMrDjoEegRGDBoxaHl5nu/UHOPHi8JsMDDnCAv8OAVq3ZbA4JuEnoIGCDRIAWkBkojapqHyZw8lYNpfpu+sY+EYRIGKDRIAo00UOpYGyKMc/IkJ1/KQa6mNekjYZ8O3aZDJkwDpW6UkuF4Rj6ekZf4+qoYBjBGwx0M2qNDhAZKDXUmKx9Ly+e5eq88jWCfDt3DYj2kBsr2Ri6vpOTDCSkoNlhDj9DoYRPWT2mgbLE4GY4mpZ8lpLjUwO/lCI0eNmP9FNJAqb54GQ4npMNxKdMs8dkIjR6xYL0NhUtdgyIDHEtKz8XEqAjNp10M+pCVcBIaKJVpPCP/ICKu882cD8QB7jNhhyw4gzRQSldCgv8bFMbTEtwcMmDwsJW4x4ghDZTidTYtfdcvJLcGEh0GFiQzkijn+GQim+Z4XhB5QeR4KSeI8SwvSzJD4TSB0xRO4ThF4hSJG/Q0zVBAkSmEB7asE2wj0eMOol+HNFBUlJXh2QD/WqLKjLQRQHNcNJLcCKcC8Wxhl6gYddhZp4U1WQxxgggIVW6Eh23EQ1ZcA0VRAV7+2louJFQLDpniuEg4eXEptKXVNjHkQLtNb2FjOBmukrEZZNCnXJQJ10C5Qd6c/NVVLl5xQ5twsPHc4lJwNZTa7nYEGPW02FotqzJeuf9txOG33dQgg2mgXJMm+fxCNlKBLcEBOnApFYxdXAgItfaAjQw51ufkjexGZcNPGMAhO/GgjdBAeUv/7uOPlIsJgaATCTMzG75opt469ZFOq7ndvlIZLrsN+KfaKQLd9KAkRXhiupyMK4GgE/jpmQ1/rA4QQQVwsZnbWlb48h91H4P9QRdd816oxqC8GOJ/4Cv5pevDhKnpjcAVROo+WzXYYbVWYF1cFHqiW2etqWGpMShfX+IuJEtwYj2kvDzjXQunoAG1q9ch2S3lRXZmAj3Zo3PVbnioxqA8M5tZyhblfzpIlPOGJpfDVXi/7fpWlnIYSAdLOVnSoiP1FMaSuJ7CGQLLCFKWl7KClBHELC+FM4I3wXkTnDeRW49zwXRFTgdCcOuOjiDNpMWSm12PwR/2MN016oRqDMrnL6UDOZUKMDiyZ1JvTKyV/S0ei+5Ap7nPxnRbmQ4zXUmF07x0ajV+ei1+cjUe58r0wS0sNTbasSCWnCqhEHy2j/HUgpUag/IXM+nFgmM6TgqtX1r1lxXUjLWyt3aZD3ZbHeyWTC+bCaZPrcZ/sRBZjXFlfHzPgDNmNmdLNC0GHD01oG/d9jncNQbl7xeyZ2OK72UvIb5xZpEvpSkJDO1yG+7ottzusZjobcpuzoczL89FfrkQCaZK65jcLWxrf5s/V9ojsJLo6UG9hUQ3EShHA/yzq3nGXygMHKnkqSlfCV04iT006jg05jDrapakOu9N/ueE/+RKvPgQmiaxPbu7l0qMn9067OkhVofdNKDEBPmz55M3vjGppY0lX6LYLp8hHt3R+sCog8brIlCeD2e+f8736mK0+I8cGGtbIZmSvmXUiH9mQH+zgAIA31nInAxftdgOCi2/uRJNFtXrUzh6bLfrkR2tFF53uRRvnPt/p72vzEeKvH5Hjz1uNedKGYK4s4X8jW7mZgFlPSN98WLyciU6aDQ1vpjMFhVNvHuw5fH9bRamrucSjq8nvvnK8kaiqFVpPW4TanOWFDl/tEt3j5O6KUABgF/4c/+6mPHQcOb0QjGuq4HGn7i3e1+nCRpBgiR//+zGD8Z9xfy0thbW3OuOFG1YcASfHzN26LGbAhQAeNWb+crzk8VcOeRkn7q/18422IKq9Rj3v/5rfjGcVQ9qDHTHSEeg6FDIQWNf2GmksZsDFAA4t5r4yyMLsYL9zv/Y3/bYO1zQmMoJ8tdfXnxlTt1rsZno1qHO4u3KXhv5W4PszQLKZf1sMvjqXOTc6jUhT6+d2e+x3Dtkc5toaHD9eCLwD8dWVOPn9hZW53GlhGKfzscH9Afs1E0EytWoIcaFU7wM0GnVmZmm2vBn2p/60o9nE5zKaGhfu0lw2rnifFsGR198h9m8ZVk4pB3DUhNtxLk/eW46mFTJ5A532yImc5H3HDYTf3iLcYsqrO3hVhu5TPT/+bVhj00HslygTC2EPDIHklxMmYrwJwM5DZRmk1VPfuXR4RGXAWQoUE6Mr3XqUOFrrpT/mEvlJA2UppOOxL708OCIi0UyFCizE2tGAgrbnsslxknPL6Y1UJpQJI7+7NBgl1VXwE7EkhwejKLijMqRlUwoK2mgNKldeXTIZaIKmIrpxXAPJRZjVERJ/v9zKQ2U5pSZIZ75teEWlkQASuXE6WUHhSEJVMvpDW4pIWigNKdaDOTnHurHQLFPkSXI+SPFGBWQ5R/OJDVQmlb9reyHb2sv4H/MLkW69UVFQFMhfi0paqA0rT5wwD3axiJZVipzU14dXlQE9JO5pAZKM+vJh/pNOkLJVISjWZfMF2NUzmxwoYykgdK0sujJT9znKUDAyXNrNhqpWhRZlo8spjRQmll3DtlG2gwFUnBslgMJVMtrKxle0kBpan36vT2Ecgh0YdJrptSNSpaXXl9Na6A0s9ptuvftcylZFEGQrVJRnsrRBQ2UZtcH72i36Mm8jx/JcGZ8zUiiAvHR5eKN88sxXgOlmUUR2MMH3AXybw4kFGNUzq1nNVCaXO/Z02qkMSVrcWnKh4N6QuVENdwUDZQ6Nyrowf2KRiWR4jtYXDX2CSXF9biggdLkenC/myFxJVZysVQxWdoza2kNlCaXjsLetduhNKT85qWAnlAf/Tm7mqlTUOIyTIbTl6KZtHBzbGkfOgehc1t074O32BXTr5Ls0qkP/azH+EimojHCKi+DmOXhFCdfzMG6CPrzG7PBFABYaKLPqntkyLHXZWgqOJZ+BIvPw+KPILdp4wLKAt2HoPsQeN5Xre/pcbHtLcxaML9VCPvioFNv2NkAt7+r/N0PqrZcIyvDd2PyiezVu7WtB05dumaDkzEH++m97X1WXcMjsnEMXv8chM8XusZ9EPY8Da67qvKFz726/uxLy/kfIYLW0Q5ObanY3f2GD7/DWuOuRwT4m6B4MiUhUb5SBBN73cyrN32pP/7Z7IQ/1dCQyCf+RD78qByblnFdoeI/KR9+FMa/Wp3eZ6cdKSdU3AyuOu1tPsBVUoHqgPKdoDiTkUC8pgRIykTiSJI3l2xO/NJL82txrlEpee2PYPpfANcVWeQLX5ePP1n599qM1ECHUclXxXhe1U1Zi+R4Ua4lKC9ExVMJEUT5+iJBp5W5DhQkyWlO/PMj82m+8Zxc+cLfwtLzxVPyVln8EVz6buXfvrPHpJR582/EVQMfWYK5CoxKpaBwMhwOC5t7nM2FNbN5U0CrUe74UrTBMAmckie/o9LdKBRp/GsQvVTh99/SZ1H6r9X1hKGIweSFYO1AeT0mZPnrO50rJcPQN1qUy+WnbwYaixPpzX8s2ZZsKtL5v66wAsNdRprElAxGiw5TNSreaPmjg5WGx2fjIij3fGGMdOipYDLPgtgZXzqSEayNsk1BbBYibwJeQbwWvgixWTD3V1KLUY/p3HR+S0yIIkgqLkggnqsZKGtJERUMzNpt+pCC63p2OXbfUEtjmJPV/5JxXeU3wSoDZdhjOncp/z48fJYHWaV/CMZrZ1HSObHwWXykkQHpht+GAAAurCcbBRQ5MgUVgyInViq8g7uFUWrtWCwLlEo+LZWVMjmJobAagCKLcmFQIjiNbszpyQAAF1fjDeOhpLyVgwIpb4U3cLXokEJrB/1psl19K9FQUuiwUTUAxYqjAFco0E0BZmepUL79MwOxnD+RcxqpBgAFr0Y2Wa50RZbbrmhR0mm+S4fH1QZ0gnG+NqB067FgWmWuQ4fDEI7lPy307GLsvTscDdD14HWxdxyBI4eFCkS4vBumm2gsrvYswslyT+WrsOojJuKUTyU6x1kdKBidRgGlOhaFtlV+D1cLE4xwee0KATKoZTEznFgbUIYtJKglhoNAYFL+scfJlcZwU5B1VI7PV3oTfRU2PjWxpFLvg11OrBUUV25CvFJQ7DqshYRwwZ1bOIB2K7MWyjNKnkqLi4F0t0Nf76A4dkup9Qpvgjl2V14TliGUQHlr1LAwKLkagQIAo1bqmNoEqhYrsx7IPxvv3Hys/kHBbKPiykuV36QKoOhwpGA2ZFHcOotShUHBYSuZZ0TwusLorkvhv72XIZyda4RBH8qMOfdWksLHnHuBMlfNouQrkiCpZvFralHsNBJVvj4gIRKhzcPcb7vt8uxKQhBlAq/3M2lx951SfAWksrLgGIV33FeVahToevicCDKqUx8FAPQkamfxtYILAgSATie7sJbnrCZBkqdXE6OeEo7KkLmYlH0724sRGG1B1NZPsqSMuOc9wvLPy/go2fMA4NVJF+koXCnnJvEiklQeKF9DiwIAwy30WkRlHMFk1CEpkTcBMD4XLQoUSRCic2JiDaTroUQEgxvbcEvf1noqJg/Rea+wfry0Jm67HbHuatWB5yUllxXDMVUfhSzXclcHlBEHfWRKJdDlKRLJ+fP949ORj9zXpQJJysf7x0HKj6Oc44VQXEysk627ELWF5/hg5l6SMvJrx5Vqcu3VJNl+O2KqmSjKcuJmi7K5OYkiQKFJrJagDDhpXJILj3L7M2CgiWQmTw+1vJFOZUVWp3ioqBRfFnxn1N+FbIhfeYXsuAvR5q1jBTEOqvcBITwtxhYK+TTWAcLSC1iV51Fw3DWjsJvbBMcxkFUSrzqyphaFwlGPjZrzF0rRygDtDv30Yizv/04uxPaN5E9cyumA4H2j2KpIPL98lOp+D5BbGXJjBGEfJWyDYjogpQOyxMu5JGAEInQIIzG9A9c7qo7IFYuimEdBSDWPoqutRQGAYSc951XJpjCsDkkKoMwrgsKvv1aUnd/EiuA7RXS8c+uzKwRucOMGN2yjshlBKY+CALau66naSsFhN6M0c/ZKSYpIaWbkeYX5OFJ0FrgoSHxJRYotyNkwNKMCwaximgSQ6oL12luUHqeOABAKjvuE09BiokPRPD2U15cJRji79fpBWjFwoTRzcoWwyDTuvq35QPEFMkr9i1jEWE/tLQqGYMilU03Ruhx6JaMyOXdDryTlILOBZL6MIsVmm9Ki+PxppQXrqax6Ztaox2tsUQBgqI25uKCyCS6uJ5FCymdqNnpwn/PafmeuPHMCANCMXU84wkkKNhvDIBzNITVn1mmlag/KcIceqU05CKVkpBBGT94wv1xOLJUPSjNqzZtS6nfsdjZdRNLV1ULXHpR2O60nUbrglIOUCDYTHb7ipmyK6kNhbnkt1dV+9VhWKbaggbJZs3NxJZthsTLppMpbajYQVM19lCtGRWkx2JXiatVfXQ55rZsyNbPJqORikA2WGu9cLYS++UCZmYspOR+08qjyleK0lT+hs9qgdLGqQTJGkkr+7NR0ZJM5mS+fEolHjL35QFlYiCstF0UYprqktOx+B6q+kc6Qx6A6MzIQEzCFOG5m+mrgI4cmUAX9DmbyNBkli0uJXFZEyq2qmpZ12qh6AaXFQloNeKTgDriZDLQ6mI2NPBPeUkl+fiHe22MCADk6DRWB0tNkoExcVIzjWtsMiaR6W7ns5U8Rr/4ebiPdBiTIhYvFzCjt93JhIgwAkFqDXLz8rgcRwLY1GSinTvmVnA+7k1V1UJAMvZ36erEoADDUYzx+IlT4GhlhSkHy9FQE3tctRS6VOZfscixlG2kySvyBzOpK8tp+5+pfMo6rNldnG1N2yLMloIz0G0FtZqQvyJE4JuSbljc/ExcEGYUnK+p3WnY2GSgn3vDf4IK89TdC4A9xqqm2wW5jJRWoPigMg7c5desFR5IFEdrd7PJi/MZfJ+TES5OR4cCJSubQIutgk4HyxusbSr5qV68lUMTWoIO9hvoCBQCG+4xetf3X9SwFUt6JkeCbOj1sqSDPprODrqli49mZ2MZ6WunNMdr0gTWVCR4YBgM99QfK4IDp6EsqK/dzuRty+W+3BB6dAFP5oCDLUJOZk6NHVhVXB2LIG+RUB4097WyF6xy2BJT+PiMmg1RwauSGL2tgydTmoO7ty13UXCUOSpN5sumUcPqkXwmFniHbeqyYfsdYYTW2BBSKwnq62Pm5ROHLWl36hRsGAhmK67cvQAVbRqLWW5vKnLy0KomKy3VoloKI+j73O0fM9QgKAAwOmuanY4WvoXXEjUAMOJYrGgg09QHBNg0luZz08xeXlfodksJWvVnVhGyrQ9fZrq9XUIbNLz63XPiaRIy/MZsy6FhAFfU7Y81kTo4cXkklFCfW94/ZF7zqO4LeeWsVXPutAqV3wKS+HYaPs9noSDB7rUWZr8hBse9qGkoyGfHwC4uKU6kRRFKSqjlBCPbtsdUvKAAwNGyavqiyAN3Rqo/6s5sclGyHeaV8B4U0gPtg04Dy0+cWMilFczK407Hkz6lGMmMjZgNL1DUoew44ps9H1HhHm3dH3dk+UZE5cd/VNJQE/JmXXlwpYDASOfXdUADg1n3VSSlt4QlgOw84SAyBIBcoQW9284jggGOmojkonoeagxJZhn/8mwtCTlI693hwhyMc4uDq7iH5i16H7dphrXdQ9Czxqx/oRqJUoCTDnNV2dRv0fsel8ubcI5lH3Q+Bc39zgPKzFxaXFuIFxoKzEirmINuDd7ZWq0pbe6bgvQ93uTvYwgs4HO63jvVp0Yda9L4yzQmuQ7f8bnNQsrac/NH35pRsCZJheLfT78+ozmcjCXTvPa7GAAUAPvbUTopABUCRxbd+WL9zCqRceQXd9hVg25uAEj4nfftr45IgKxkJPUtshPlizMnttzkYBm8YUOxu5vHP7igwhda/nMJkQBLsaDtVpmty+1eh873NYU7++RsTgY1MgcffNerIpAVVc4IhuP/+ak7d2o7jbEcPOD7zV7eyLJ7/qJZYztmmR5Lc77hYDiV3/BX0fag5KDn6k+Vzr/uUTm9CstzebZyfT6ouMAYJbrvVYTKRDQYKAHQOmj77rTs9g+a8vY/RTHeYF/VEFEl8CcUyjA69DP0faQ5K5qdj//HPl1Q6FIYu5jhskkAPvq+zutXbvgOyjTb6979+2wO/OaBnietAETipzzlRgiHRu+HgN+H9r4JtR3NQ4vem/+7LZwpTMnLAFfRnCzi5V8rd97gMhipnyKp2nG1JeuOFlelTgeXJaGQjAwCUDv/127882qa2N1rLLmi7G9x3Q/fD0ESKRbivPPVGLFxo1MYzbPGGhWKelU6Hf/F/7qV1eDOAoumKMmnhfz/1un+90IRAq5MRdXSmuKPQH32s+533VX9vH0J7VDVUIpb75p+f9q8VnDaKgLGzAX+2mBu62vQH792SHaA0UGom32rqG188HQlmCw/sDe53zc8ni7znr39sAG3Nzs4aKLXRzET4W8+c5bIqvcnwgdZZtYmCV3TP/W0dXVs1aUsDpQb65Y+Xv/8Pk6qXDe51zs4Va0ta7PSDj2zhcmsNlG2VKMj/9rcTJ46uq/YPnhHr4nIKios0EILHPzVEUpgGSjMoHuG+/aUzy7PqZ1m5e02+iCAVfVjXux7o8FQ8z14DpS40ftz3vb97MxFVX1Dd1mtK8CDkxCK90rZO9qEPdG91/TVQtlzREPe9b0xcPBkAANVn3z5giaQkVSf3imgd/hu/sx3rmDRQtlYv/+fiC/8ykyvuyMeeHS3r/qzAF5sCxTD45BNjTjejgdKo4nPSsR8vH/3hQjTIFfmR3l32lfWMJJaQKP/Qx4f6hs3b84s0UKqsVJw/9sLyyz9cTCf5YvqayxrY75wrOl9yWfc+2Hngna3b9rs0UKqm6XOh4z9dGX/NJ5ZyHBtrpuz9lrnZ0ijZdcB+6KO92/nrtEHBShXypk+/7H39xZXQRqbUz3aNWqNpKRkvbW+poZ2233pqB4Zt6ymMmkUpU77l5Llfbowf21ifTwAAICjpueEU1rPbMT8TL/U97eozfuLJW7aZEs2ilCCBl5amYktT0aXJyOJULBbMln0r94CZx1DIV/IdOnuNn/7CbkZfg9dbsygq4tLC6y+uXHjVN3c+DAAVvlV6A9k2ZluYjssylGoTPIOmT39hD0VjNWkHzaIoxy+x3M+fnXvtheVc0emvwurb5/D5sqlEOWtmB3ZYP/H0ri0dzdFAKUdLk9Fvf+5EJilU5W6eHTYeIe9yqryP777T+fgTt9S2QTRQ8mhjMfnXv/NqFQwJgt69jliCD/kyZd/jPY/1/MqHe2veJhoo14vPSV/9+C8Dq6nSiLhWBhvdOmD2rWdKDX2v0+NP3rL7rtZ6aBbNmb1eR5+dC6yU2ke89bJhOOocsyIdsXgplpyMVlINo5X65J/u6egz1kmzaKBcr5f/fa6MHIXFzbR0GTe8maXFVOV16B2zfOzpXWxVl/ppoFRTF1/1celiXROTQ2frMGAUFg1zIV8m8ma0KnW4+/2eQx8bRFh9tYwGyjVamYoVSJUYbLS5laEMJEagkJ+LBDKxIqarFS/GQDz2u6O76sMp0UAp7GvIXWMWjMAwDAGOEAJASJLkTEaMBblkik9ucl+qm0Xf9662Q58cqqvuRgNFUYKMlqvhZJSkFjfz2GfG+nfa6rllNFCujTUsFGxjvkBvJN/9kd67DnlwAtV5y2igXKP2PiNsCyckjR18v+fdH+6j9XhDtIwGyjUa2NNCM1jxgU85LU5hdzzUde8He0wVnBmqgVJ77b2v/bXnl7fizqyJvOv9noOPdDOGxmt2LYV/vSK+7DMfPVrde9rczD0f7L31VzsICmvQZtFAyaOf/NP0kX+dq8qtum+x3vPBnh0HWxu9TTRQ8usbv3d8cSJS9setrcyOg6533N/eMWhqjgbRQMmvXFb8t2fOTRzzlfSpVo9h5HbnzrtdXSOWJmsQDZRCGj/qfeFbk5GC0+uNNnpgr31wn31wv6OxAhkNlCrrwi82Th1e9S0mov6sq8fImilHJ+voZFs9RqeHNVVwjr0GiqZmE6Y1gSYNFE0aKJo0UDRpoGjSQNGkgaJJkwaKJg0UTRoomjRQNNWj/huikYGhHiMtqwAAAABJRU5ErkJggg==";

const defaultId = "default";
let theLocale = null;

//let data ={};

class scratch3_davinci {
    constructor(runtime) {
        theLocale = this._setLocale();
        this.runtime = runtime;
        // communication related
        this.comm = runtime.ioDevices.comm;
        this.session = null;
        this.runtime.registerPeripheralExtension("davinci", this);
        //davinci setup
        this.ASSISTANT_ID='';
        this.API_KEY='';
        this.INPUT_MSG='';
        this.BASE_URL="https://prod.dvcbot.net/api/assts/v1";
        this.thread_id={};
        this.davinciURL = "";
        this.myheaders={};
        this.ai_anaswer='';

        // session callbacks
        this.reporter = null;
        this.onmessage = this.onmessage.bind(this);
        this.onclose = this.onclose.bind(this);
        this.write = this.write.bind(this);
        // string op
        this.decoder = new TextDecoder();
        this.lineBuffer = "";
        this.data = {};
        
        this.emptyObj = {
            VALUE: {},
        };

        
    }

    onclose() {
        this.session = null;
    }

    write(data, parser = null) {
        if (this.session) {
            return new Promise((resolve) => {
                if (parser) {
                    this.reporter = {
                        parser,
                        resolve,
                    };
                }
                this.session.write(data);
            });
        }
    }

    onmessage(data) {
        const dataStr = this.decoder.decode(data);
        this.lineBuffer += dataStr;
        if (this.lineBuffer.indexOf("\n") !== -1) {
            const lines = this.lineBuffer.split("\n");
            this.lineBuffer = lines.pop();
            for (const l of lines) {
                if (this.reporter) {
                    const { parser, resolve } = this.reporter;
                    resolve(parser(l));
                }
            }
        }
    }

    scan() {
        this.comm.getDeviceList().then((result) => {
            this.runtime.emit(
                this.runtime.constructor.PERIPHERAL_LIST_UPDATE,
                result
            );
        });
    }

    _setLocale() {
        let nowLocale = "";
        switch (formatMessage.setup().locale) {
            case "zh-tw":
                nowLocale = "zh-tw";
                break;
            default:
                nowLocale = "en";
                break;
        }
        return nowLocale;
    }

    getInfo() {
        theLocale = this._setLocale();

        return {
            id: "davinci",
            name: msg.name[theLocale],
            color1: "#08086E",
            color2: "#08086E",
            menuIconURI: menuIconURI,
            blockIconURI: blockIconURI,
            blocks: [
                {
                    opcode: 'davinci_apikey',
                    blockType: BlockType.COMMAND,
                    arguments: {
                        KEY: {
                            type: ArgumentType.STRING,
                            defaultValue: 'api key'
                        },
                    },
                    text: msg.davinci_apikey[theLocale]
                },
                {
                    opcode: 'assistant_id',
                    blockType: BlockType.COMMAND,
                    arguments: {
                        ID: {
                            type: ArgumentType.STRING,
                            defaultValue: 'assistant_id'
                        },
                    },
                    text: msg.assistant_id[theLocale]
                },                
                {
                    opcode: "sendDavinci",
                    blockType: BlockType.COMMAND,
                    arguments: {
                        VALUE: {
                            type: ArgumentType.STRING,
                            defaultValue: " ",
                            //defaultValue: "value",
                        },
                    },
                    text: msg.sendDavinci[theLocale],
                },
                {
                    opcode: 'airesponse',
                    blockType: BlockType.REPORTER,
                    text: msg.ananswer[theLocale],
                    arguments: {
                        id: {
                            type: ArgumentType.STRING,
                            defaultValue: 'id'
                        }
                    },
                },
                {
                    opcode: 'copyTEXT_memory',
                    blockType: BlockType.COMMAND,
                    arguments: {
                        TEXT: {
                            type: ArgumentType.STRING,
                            defaultValue: ' '
                        },
                    },
                    text: msg.copyTEXT_memory[theLocale]
                },
            ],
            menus: {
                /*symbolItem: {
                    acceptReporters: true,
                    items: [">", ">=", "!=", "=", "<=", "<"],
                },*/
            }
        };
    }




    //estea
    copyTEXT_memory(args){
        const copy_text = args.TEXT;
        navigator.clipboard.writeText(copy_text).then(function() {
            console.log('Async: Copying to clipboard was successful!');
          }, function(err) {
            alert(err);
            console.error('Async: Could not copy text: ', err);
          });

    }

    davinci_apikey(args){
        this.API_KEY=args.KEY;
        console.log('this.API_KEY',this.API_KEY);
    }
    assistant_id(args){
        this.ASSISTANT_ID=args.ID;
        console.log('this.ASSISTANT_ID=',this.ASSISTANT_ID);
    }

    airesponse(){
        return this.ai_anaswer;
    }

    //davinci
    async sendDavinci(args) {
        //this.ASSISTANT_ID=args.ASSISTANT_ID;
        //this.API_KEY=args.API_KEY;
        if(this.ASSISTANT_ID.length<20 || this.API_KEY.length<200){
            alert(msg.api_assistant_error[theLocale]);
        }
        this.INPUT_MSG=args.VALUE;

        const AUTH_HEADER = 'Authorization: Bearer '+this.API_KEY;
        const THREAD_URL = this.BASE_URL+'/threads';
        this.myheaders={
            "OpenAI-Beta" : "assistants=v2",
            "content-type": "application/json",            
            "Authorization": "Bearer "+this.API_KEY,
        }
        //let mydata = '{} | jq .id | tr -d " ';
        let dd = new Date();
        var H = dd.getHours();
        var M = dd.getMinutes();
        if (M < 10) {
            M = "0" + M;
        }
        var S =dd.getSeconds();

        var d = dd.getDate();
        var m = dd.getMonth();
        var Y = dd.getFullYear();

      let CREATE_RUN_DATA={
          "assistant_id": this.ASSISTANT_ID,
          "additional_instructions": 'The current time is: '+Y+'-'+m+'-'+d+' '+H+':'+M+':'+S,
          //additional_instructions: 'The current time is: '+new Date().toISOString(),
        }
      //test jq 
      console.log ('creat_run_data=',CREATE_RUN_DATA);
      let mythread=await jQuery.ajax({
        type: 'POST',
        url: THREAD_URL,
        headers:this.myheaders,
        data:'{} | jq .id | tr -d " ',
        error:this.ai_anaswer=msg.thread_id_error[theLocale],
      });
      this.ai_anaswer='post_thread:'+mythread.status;
      this.thread_id=mythread.id;
      console.log('mythread_id=',mythread.id);
      let loop_n=1;
        do{
            setTimeout(() => {
                console.log("Delayed for 0.1 second.");
            }, "100");
            loop_n++;
        }while(this.thread_id=='' && loop_n<50);
        if(this.thread_id===''){
            this.ai_anaswer=msg.thread_id_error[theLocale];
            return this.ai_anaswer;
        }
        let MSG_URL=this.BASE_URL+'/threads/'+this.thread_id+'/messages';
        console.log('msg_url=',MSG_URL);

        let msg_response=await jQuery.ajax({
                    type: 'POST',
                    url: MSG_URL,
                    headers:this.myheaders,
                    data:JSON.stringify({
                        "role": "user",
                        "content": this.INPUT_MSG,
                        }),
                  });
        console.log('msg_response=',msg_response);          
        setTimeout(() => {
                console.log("Delayed for 0.5 second.");
        }, "500");    
        let RUN_URL=this.BASE_URL+"/threads/"+this.thread_id+"/runs";
        console.log ('RUN_URL=',RUN_URL);
        let run_response=await jQuery.ajax({
                type: 'POST',
                url: RUN_URL,
                headers:this.myheaders,
                data:JSON.stringify(CREATE_RUN_DATA)+" | jq .id | tr -d ",
              });
        this.run_id=run_response.id;   
        console.log('run_response.id=',run_response.id);

        setTimeout(() => {
            console.log("Delayed for 0.5 second.");
        }, "500");    
        let run_staus='';
        let required_action='';
        while(run_staus!=='completed'){
            run_resp=await jQuery.ajax({
                type: 'GET',
                url:RUN_URL+'/'+this.run_id,
                headers:this.myheaders,
            })
            run_staus=run_resp.status;
            console.log('314run_staus=',run_staus);
            required_action=run_resp.required_action;
            console.log('316run_resp=',run_resp);
            console.log('317run_resp.required_action=',run_resp.required_action);

            if (run_staus == 'requires_action' && required_action) {
                let TOOL_OUTPUTS = [];
                for (const toolCall of required_action.submit_tool_outputs.tool_calls) {
                    const FUNC_NAME = toolCall.function.name;
                    let ARGS = toolCall.function.arguments;
                    const PLUGINAPI_URL = `${this.BASE_URL}/pluginapi?tid=${this.thread_id}&aid=${this.ASSISTANT_ID}&pid=${FUNC_NAME}`;
                    console.log('PLUGINAPI_URL=',PLUGINAPI_URL);
                    /*const OUTPUT = await jQuery.ajax({
                        type: 'POST',
                        url:PLUGINAPI_URL,
                        headers:this.myheaders,
                        body: JSON.stringify(ARGS),
                    })
                    .then(res => res.text());*/
                    const OUTPUT = await fetch(PLUGINAPI_URL, {
                        method: 'POST',
                        headers: this.myheaders,
                        body: JSON.stringify(ARGS)
                    }).then(res => res.text());
                    TOOL_OUTPUTS.push({
                        tool_call_id: toolCall.id,
                        output: OUTPUT.slice(0, 8000)
                    });
                    console.log('342tool_out=',TOOL_OUTPUTS);
                }

                const SUBMIT_TOOL_OUTPUT_RUN_URL = `${this.BASE_URL}/threads/${this.thread_id}/runs/${this.run_id}/submit_tool_outputs`;
                const TOOL_OUTPUTS_DATA = { tool_outputs: TOOL_OUTPUTS };
                await fetch(SUBMIT_TOOL_OUTPUT_RUN_URL, {
                method: 'POST',
                headers: this.myheaders,/*{
                    'OpenAI-Beta': 'assistants=v2',
                    'Content-Type': 'application/json',
                    'Authorization': AUTH_HEADER
                },*/
                body: JSON.stringify(TOOL_OUTPUTS_DATA)
                });
            }
            await new Promise(resolve => setTimeout(resolve, 1000));  // Sleep 1 second
        }

            const responseMsgResponse = await jQuery.ajax({
                type: 'GET',
                url:MSG_URL,
                headers:this.myheaders,
            });
            //let responseMsgResponse_json=responseMsgResponse.json();
            console.log('000=',responseMsgResponse);
            const RESPONSE_MSG = responseMsgResponse.data[0].content[0].text.value;
            //const RESPONSE_MSG = responseMsgResponse.data.content.text.value;
            console.log(`you: ${this.INPUT_MSG}`);

            this.ai_anaswer=RESPONSE_MSG;
            const index_http= this.ai_anaswer.indexOf('http');
            if(index_http>0){
                const one=this.ai_anaswer.split('(');
                    let two = '';
                    for(i=1;i<one.length;i++){
                     two=one[i].split(')');
                    window.open(two[0]);
                    }
                
            }
            this.API_KEY='';
            this.ASSISTANT_ID='';
            console.log(`\ndavinci bot: ${RESPONSE_MSG}`);    
            
        //}
            //console.log('run_resp=',run_resp);
            //console.log('run_resp.required_action=',run_resp.required_action);
            //console.log('run_staus=',run_staus);
        
    }



}

module.exports = scratch3_davinci;
