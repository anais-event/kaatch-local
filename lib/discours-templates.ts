export type Ton = 'humour' | 'emotion' | 'equilibre'
export type Duree = 'court' | 'moyen' | 'long'

interface SectionPool {
  humour: string[]
  emotion: string[]
  equilibre: string[]
}

const SECTIONS: Record<string, SectionPool> = {
  opening: {
    humour: [
      `Quand [P1] m'a demandé de faire ce discours, j'ai dit oui sans réfléchir. Grande erreur. Parce qu'il s'avère que parler de [P1] en public, trouver les mots justes sans le faire rougir de honte ou de fierté, c'est un vrai exercice d'équilibriste. J'ai quand même accepté, parce que certaines personnes méritent qu'on se donne du mal. Et [P1] est de celles-là.`,

      `Je vais être honnête : j'avais préparé un discours court, percutant, impeccable. Et puis j'ai commencé à penser à tout ce que je pourrais dire sur [P1], et me voilà. Avec bien plus de matière que prévu. La bonne nouvelle, c'est que je ferai le tri. La moins bonne, c'est que [P1] ne sait pas encore ce que j'ai décidé de garder.`,

      `Il paraît qu'un bon discours de mariage doit faire rire, faire pleurer, et se terminer avant que le repas refroidisse. Je vais faire de mon mieux sur les trois points. Commençons par [P1], dont la vie avant [P2] mériterait à elle seule un roman — mais on n'a pas toute la nuit.`,
    ],
    emotion: [
      `Il y a des moments dans une vie où les mots semblent insuffisants. Ce soir en fait partie. Voir [P1] et [P2] ici, entourés de ceux qui les aiment, c'est un de ces moments que l'on garde longtemps. Je vais essayer de mettre des mots là-dessus, même si je sais que ce que je ressens dépasse ce que je vais réussir à dire.`,

      `Je connais [P1] depuis suffisamment longtemps pour savoir que certaines personnes changent la façon dont on voit les choses. [P1] est une de ces personnes pour moi. Alors quand on m'a demandé de prendre la parole ce soir, j'ai dit oui, les yeux fermés. Parce que c'est l'une de ces occasions où il faut dire les choses à voix haute.`,

      `Faire un discours de mariage, c'est une responsabilité. Parce qu'on ne parle pas juste de deux personnes qui s'aiment — on parle d'une histoire, d'un choix, d'un engagement. Et quand on connaît [P1] comme je le connais, on prend ça au sérieux.`,
    ],
    equilibre: [
      `Permettez-moi de commencer par quelque chose d'important : [P1] m'a demandé d'être bref. Ce à quoi j'ai répondu que je ferais de mon mieux. Ce qui, dans notre amitié, signifie environ vingt minutes. Mais je plaisante. À peu près. Plus sérieusement — être là ce soir, pour [P1] et [P2], c'est un bonheur que je n'aurais manqué pour rien au monde.`,

      `J'ai longtemps cherché comment commencer ce discours. Et puis j'ai pensé à [P1] — à tout ce qu'on a partagé, à ce que je sais de cette personne — et les mots sont venus d'eux-mêmes. Parce que parler de quelqu'un qu'on aime vraiment, c'est plus simple qu'il n'y paraît. Même si on peut se permettre d'en rire un peu au passage.`,

      `La vérité, c'est que je ne suis pas du genre à faire des discours. Je préfère agir. Mais certaines occasions méritent qu'on s'arrête, qu'on prenne le temps de dire les choses. Aujourd'hui est l'une d'elles. Alors je vais essayer d'être à la hauteur — avec un peu d'humour et beaucoup de sincérité.`,
    ],
  },

  histoire: {
    humour: [
      `Je connais [P1] depuis assez longtemps pour avoir des anecdotes compromettantes. Je ne les partagerai pas ce soir — [P2] est là, et j'ai un minimum de sens des responsabilités. Mais je peux vous dire que [P1], avant [P2], c'était une personne en construction. Brillante, attachante, mais en construction. Quelque chose a changé quand [P2] est arrivé(e). Pas du tout au tout — je ne voudrais pas exagérer. Mais suffisamment pour que tout le monde autour s'en aperçoive.`,

      `La première fois que [P1] m'a parlé de [P2], c'était d'une façon très caractéristique : trois phrases en passant, comme si c'était anodin. J'ai attendu la suite. Elle est arrivée le lendemain, puis le surlendemain. En une semaine, [P2] occupait la moitié de toutes nos conversations. C'est à ce moment-là que j'ai compris que c'était sérieux. [P1] n'avoue jamais rien directement — mais ça, c'était une déclaration.`,

      `Ce que peu de gens savent sur [P1], c'est l'écart entre ce qu'il montre et ce qu'il est vraiment. En public : décontracté, sûr de lui, toujours une répartie. En privé : quelqu'un qui se soucie énormément, qui réfléchit beaucoup, et qui est capable d'une loyauté absolue. [P2] a vu les deux versions très vite. Et a choisi de rester. C'est déjà un signe d'excellent jugement.`,
    ],
    emotion: [
      `Je me souviens de la première fois que [P1] m'a vraiment parlé de [P2]. Ce n'était pas un grand discours — juste quelques mots, une lumière différente dans les yeux. Mais je connais [P1] depuis longtemps, et j'ai su. Certaines choses ne s'expliquent pas, elles se reconnaissent. Ce que [P1] portait ce jour-là, c'était une forme de certitude, tranquille et profonde.`,

      `Quand on partage autant avec quelqu'un — les bons moments, les périodes difficiles, les doutes et les victoires — on finit par savoir ce dont cette personne a besoin pour être heureuse. Et depuis que [P2] est dans la vie de [P1], quelque chose a changé. Pas [P1] lui-même, mais quelque chose autour. Comme si les choses s'étaient mises en ordre, naturellement, sans forcer.`,

      `[P1] et moi, on a traversé pas mal de choses ensemble. Et ce que j'ai appris sur [P1] au fil des années, c'est que cette personne aime profondément, silencieusement, sans le montrer à tout le monde. Voir [P1] s'ouvrir comme il le fait avec [P2] — c'est un cadeau rare. Et je suis reconnaissant d'en être témoin ce soir.`,
    ],
    equilibre: [
      `Voilà ce que j'ai appris sur [P1] avec le temps : cette personne est bien meilleure qu'elle ne le croit. Généreuse, fiable, drôle même — surtout quand elle ne le fait pas exprès. Et quand [P2] est arrivé(e), j'ai vu quelque chose de beau se passer. [P1] a commencé à le croire aussi. Ce n'est pas rien.`,

      `Je pourrais vous raconter des histoires sur [P1]. Il y en a des bonnes, et il y en a... d'autres. Mais ce soir, je choisis celle-ci : la fois où [P1] m'a dit, presque en s'excusant, qu'il pensait avoir trouvé quelque chose de rare avec [P2]. Je lui ai répondu qu'il avait l'air terrorisé. Il a dit : "Exactement." Et j'ai su que c'était sérieux.`,

      `Ce que j'admire chez [P1], au-delà de tout — et il y a des choses moins admirables, je le précise — c'est la loyauté. Une loyauté sans bruit, sans conditions. Ceux qui ont la chance de l'avoir dans leur vie le savent. Et [P2] l'a — entièrement. Je pense que c'est la plus belle chose que [P1] puisse offrir.`,
    ],
  },

  qualites: {
    humour: [
      `Ce que vous devez savoir sur [P1] — et que [P2] a découvert depuis — c'est que cette personne est incapable de faire les choses à moitié. Que ce soit dans ses projets, ses opinions, ses amitiés... ou ses discours de mariage. [P1] aurait improvisé le sien. Et ça aurait probablement été meilleur que ce que j'ai préparé. C'est légèrement agaçant, et c'est une des raisons pour lesquelles on l'aime.`,

      `[P1] a des qualités que je n'aurais jamais listées si on me l'avait demandé il y a dix ans. La patience — enfin, une certaine forme de patience. La générosité — sélective, mais réelle. Et une capacité à mettre les gens à l'aise qui devrait être étudiée scientifiquement. Sur ce dernier point, je suis sérieux.`,

      `Si je devais résumer [P1] en un mot, ce serait : imprévisible. Pas dans le mauvais sens — dans le sens où on ne sait jamais exactement ce qu'on va trouver, mais que c'est toujours mieux qu'on ne l'espérait. [P2] a compris ça très vite. Et a décidé que c'était exactement ce qu'il lui fallait. Respect.`,
    ],
    emotion: [
      `Ce que les gens qui connaissent [P1] savent — et ce que les autres découvrent toujours avec surprise — c'est que derrière une certaine façade se cache quelqu'un d'une grande douceur. [P1] écoute vraiment. [P1] se souvient. [P1] est là. Pas de façon spectaculaire, pas pour qu'on le remarque. Juste là. C'est une qualité rare et précieuse, et [P2] a bien de la chance de l'avoir pour soi.`,

      `Il y a des gens qui apportent quelque chose quand ils entrent dans une pièce. [P1] est de ceux-là. Pas par le bruit ou l'éclat — mais par une forme de bienveillance tranquille, de présence rassurante. Avec [P1], on se sent entendu. On se sent compté. Et ça, dans un monde où tout va vite, ça n'a pas de prix.`,

      `Ce qui me touche le plus chez [P1], c'est l'honnêteté. Une honnêteté parfois inconfortable — celle qui vous dit la vérité même quand vous ne la demandez pas, mais toujours avec bienveillance. [P2] a trouvé là un ancrage précieux. Quelqu'un qui sera toujours vrai, même quand c'est difficile.`,
    ],
    equilibre: [
      `[P1] a une qualité que j'ai longtemps trouvée à la fois admirable et exaspérante : jamais vraiment de plainte. Pas parce que tout va bien — mais parce que [P1] préfère trouver une solution. [P2] a dû apprendre à décoder ça. Je lui souhaite bonne chance — mais aussi, je peux confirmer que ça vaut le coup.`,

      `Je vais vous dire ce que j'apprécie vraiment chez [P1]. Cette personne fait partie de ceux qui transforment leur entourage sans s'en rendre compte. Pas par des grands gestes, mais par une accumulation de petites attentions, de mots justes, de présences aux bons moments. [P2] le sait déjà. Et moi, ça me fait chaud au cœur de pouvoir le dire à voix haute ce soir.`,

      `[P1] fait partie de ces gens sur qui on peut vraiment compter. Pas de façon spectaculaire, pas en cherchant la reconnaissance — mais de façon constante. Et dans la durée, c'est ça qui compte. [P2] a trouvé là quelque chose de solide. Et je crois que [P1] aussi.`,
    ],
  },

  couple: {
    humour: [
      `Ce que j'ai observé chez [P1] et [P2], c'est qu'ils ont développé un langage à eux. Des regards, des demi-mots, des silences qui signifient quelque chose. De l'extérieur, ça ressemble parfois à une scène de film muet. Mais à l'intérieur, manifestement, tout est parfaitement clair. C'est le genre de complicité qui ne se fabrique pas — elle arrive, ou elle n'arrive pas. Et quand elle arrive, on la reconnaît immédiatement.`,

      `Il y a quelque chose que [P2] a réussi à faire que je pensais impossible : rendre [P1] légèrement raisonnable. Pas entièrement — ce serait trop demander. Mais suffisamment pour que les gens autour ne s'inquiètent plus autant. C'est un exploit considérable, et je pense qu'il mérite d'être célébré officiellement ce soir.`,

      `Ce qui me plaît dans cette histoire, c'est qu'ils n'ont pas cherché à s'améliorer mutuellement. Ils se sont juste acceptés. Ce qui est en fait bien plus difficile et bien plus rare. [P1] reste [P1], [P2] reste [P2] — et ensemble, ça donne quelque chose qui n'existait pas avant et qui ne ressemble à rien d'autre.`,
    ],
    emotion: [
      `Quand je vois [P1] et [P2] ensemble, ce qui me frappe, c'est la simplicité. Pas la facilité — je ne dis pas que c'est facile. Mais cette façon qu'ils ont de s'alléger mutuellement, de rendre les choses moins lourdes. On dit souvent qu'on trouve "la bonne personne" comme s'il s'agissait d'un coup de chance. En les regardant, j'ai plutôt l'impression que c'est un choix — fait et refait chaque jour.`,

      `J'ai vu [P1] traverser des périodes difficiles. Et dans ces moments, ce qu'on cherche — ce dont on a besoin — c'est quelqu'un qui ne cherche pas à réparer, mais qui est simplement là. [P2] est ce quelqu'un pour [P1]. Et je crois que c'est la définition la plus honnête de l'amour : être là, sans conditions, dans la durée.`,

      `Ce que [P1] et [P2] ont construit ensemble, c'est quelque chose que j'aurais du mal à mettre en mots dans d'autres circonstances. Mais ce soir, dans cette lumière, entouré de tout ce qu'ils aiment — je crois que ça se voit simplement. Ils sont bien. Bien ensemble. Et cette évidence-là, cette paix qu'on perçoit quand on les regarde, c'est ce que je leur souhaite de garder longtemps.`,
    ],
    equilibre: [
      `On aurait pu s'attendre à ce que [P1] et [P2] soient parfaitement similaires — ou au contraire totalement opposés. La vérité est plus intéressante : ils se ressemblent sur l'essentiel et se complètent sur le reste. [P1] apporte quelque chose que [P2] n'a pas, et réciproquement. Et cette alchimie-là — légère en apparence, solide en profondeur — c'est ce qui me rend confiant pour eux.`,

      `Avec [P1] et [P2], j'ai appris quelque chose sur les couples qui durent : ce n'est pas l'absence de désaccords, c'est la façon de les traverser. Et ces deux-là, je les ai vus gérer les petites frictions avec une combinaison de ténacité et d'humour qui mérite franchement le respect.`,

      `Ce que j'aime dans ce qu'ils ont construit — outre le fait que c'est beau, et c'est beau — c'est qu'on sent que ça a été choisi consciemment. Pas subi, pas subi par habitude. [P1] et [P2] ont décidé d'être ensemble, et ils continuent de le décider. C'est simple en théorie et magnifique en pratique.`,
    ],
  },

  souvenir: {
    humour: [
      `Il y a un souvenir qui me revient souvent quand je pense à [P1]. Je ne vais pas le raconter en détail — certaines personnes dans cette salle n'ont pas besoin de savoir tout ça. Mais je peux dire que ça résume assez bien qui est [P1] : quelqu'un qui fonce, qui rit de ses propres erreurs, et qui transforme les moments ratés en anecdotes mémorables. Un talent rare.`,

      `Ce que peu de gens savent, c'est que [P1] a un don particulier : celui de rendre mémorables les moments les plus anodins. Une soirée ordinaire avec [P1] devient toujours un peu extraordinaire. Je pense que [P2] l'a compris très vite — et que c'est une des raisons pour lesquelles cette personne a su que c'était différent.`,

      `Parmi tous nos souvenirs communs, mes favoris sont souvent les plus improbables. [P1] a ce talent de créer de la bonne humeur là où on ne l'attendait pas. Et de transformer ce qui aurait pu être embarrassant en quelque chose dont on rit encore des années après. [P2] a signé pour une vie d'anecdotes. Je ne m'en fais pas pour lui.`,
    ],
    emotion: [
      `Il y a des moments qu'on garde dans un coin de la mémoire — pas parce qu'ils sont extraordinaires, mais parce qu'ils sonnent juste. Avec [P1], j'en ai quelques-uns. Des conversations dont je me souviens mot pour mot. Des silences qui disaient beaucoup. Et cette façon qu'a [P1] d'être vraiment présent, même quand rien de particulier ne se passe.`,

      `Je me souviens d'un moment, il y a quelque temps, où [P1] et moi avons eu une conversation sur l'amour, sur ce qu'on en espérait. Ce soir, en regardant [P1] aux côtés de [P2], je pense à cette conversation. Et je me dis que les choses arrivent, parfois, exactement comme on l'avait imaginé. Peut-être mieux.`,

      `[P1] ne fait pas les choses à moitié quand il s'agit d'amour. Je le sais parce que je l'ai vu. Alors voir [P1] heureux ce soir — vraiment heureux — c'est un cadeau que je ne prends pas à la légère. Et que je garderai longtemps.`,
    ],
    equilibre: [
      `Je pourrais raconter beaucoup d'histoires ce soir. J'en ai gardé quelques-unes pour plus tard. Mais sérieusement : ce que je retiens de toutes ces années avec [P1], c'est une constante — cette personne est authentique. Et l'authenticité, dans la durée, c'est la chose la plus précieuse qui soit.`,

      `Les meilleurs souvenirs qu'on construit avec quelqu'un ne sont pas forcément les plus spectaculaires. Avec [P1], mes souvenirs favoris sont souvent les plus simples. Et je me dis que c'est bon signe pour la suite : quelqu'un qui sait trouver de la valeur dans le quotidien est quelqu'un qui sera heureux dans la durée.`,

      `Il y a quelque chose que [P1] fait depuis que je le connais : être présent. Pas spectaculairement, mais vraiment. Dans les moments importants comme dans les moments ordinaires. Ce soir en est un exemple parfait — [P1] est entièrement là, avec [P2], avec vous tous. Et c'est exactement ce qu'il fallait.`,
    ],
  },

  avenir: {
    humour: [
      `Pour la suite, je ne vais pas vous faire la liste des conseils habituels. [P1] ne les écouterait pas de toute façon — on se connaît. Ce que je souhaite à [P1] et [P2], c'est de garder ça : cette capacité à se faire rire, même dans les moments où il n'y a pas grand-chose de drôle. Le rire ensemble, c'est la chose la plus solide que je connaisse.`,

      `L'avenir, je ne peux pas vous le prédire. Personne ne le peut, et c'est très bien comme ça. Ce que je peux vous dire, c'est que vous avez tout ce qu'il faut : la complicité, le respect, l'amour — et apparemment, une résistance aux discours de mariage qui augure bien de votre endurance en général.`,

      `Je voudrais juste dire à [P1] et [P2] : prenez soin de ce que vous avez. Pas avec une inquiétude permanente — mais avec attention. Continuez à vous surprendre l'un l'autre. Continuez à vous choisir, même les jours où c'est moins évident. Et si jamais vous avez un doute, appelez quelqu'un de compétent. Pas moi — je suis disponible, mais je ne suis pas thérapeute.`,
    ],
    emotion: [
      `Je vous souhaite des années qui ressemblent à ce soir — pas nécessairement dans l'éclat et la fête, mais dans ce sentiment d'être exactement là où vous devez être. Je vous souhaite des projets qui vous grandissent, des épreuves qui vous rapprochent, et des bonheurs simples en nombre infini.`,

      `Vous avez tout ce qu'il faut pour construire quelque chose de beau. La bienveillance, l'humilité de rester curieux l'un de l'autre, et cet amour qui se voit ce soir sur vos visages. Continuez à vous regarder comme ça. À vous choisir, encore et encore. C'est tout ce que je vous souhaite — et c'est immense.`,

      `L'avenir appartient à ceux qui le construisent avec patience et générosité. Vous deux avez ces qualités à revendre. Alors je suis serein. Je sais que ce que vous bâtissez ensemble sera solide, singulier, et profondément à votre image.`,
    ],
    equilibre: [
      `Pour la suite, je vous souhaite beaucoup de choses. De la légèreté quand les choses se compliquent. De la profondeur quand les choses se font routinières. Et la sagesse de savoir distinguer les deux. Vous avez manifestement déjà une longueur d'avance — ce soir en est la preuve.`,

      `On dit que les débuts sont faciles et que c'est la durée qui est difficile. Je ne suis pas tout à fait d'accord. Les débuts ne sont pas faciles — choisir quelqu'un, vraiment, c'est courageux. Ce que vous faites ce soir, c'est courageux. Et je crois que vous avez tous les deux le profil pour aller loin.`,

      `Restez curieux l'un de l'autre. Les gens changent, les années passent, et la plus belle aventure est de se redécouvrir mutuellement au fil du temps. Avec tout ce que j'ai vu de [P1] et [P2], j'ai confiance que vous y parviendrez — et avec style.`,
    ],
  },

  toast: {
    humour: [
      `Alors voilà. Je pourrais continuer encore longtemps — j'ai du matériel. Mais la cuisine s'impatiente, et il paraît qu'un bon discours s'arrête avant que les gens commencent à regarder leur assiette. Je lève mon verre à [P1] et [P2] — à votre bonheur, à votre complicité, et à tous les moments que vous n'avez pas encore vécus. Santé !`,

      `Je terminerai avec la seule chose que je sache dire avec certitude : vous méritez ce soir, et tout ce qui vient après. À [P1] et [P2] — longue vie, grand amour, et si possible, quelques soirées sans que je sois invité. Je plaisante. À votre santé !`,

      `Il me reste une chose à faire : lever mon verre. À [P1] — pour être toi, exactement comme tu es. À [P2] — pour l'avoir vu. Et à vous deux — pour avoir eu l'intelligence de ne pas laisser passer ça. À votre santé !`,
    ],
    emotion: [
      `Je vous souhaite de vous aimer longtemps — et différemment avec les années, comme les bonnes choses qui se bonifient. Vous avez quelque chose de rare et de précieux. Prenez-en soin. À [P1] et [P2].`,

      `Ce soir, je suis heureux d'être là. Heureux pour vous, heureux de vous. Que cette journée soit le premier chapitre d'une histoire longue et belle. Je vous aime. À votre santé.`,

      `Il n'y a pas de mots assez grands pour ce que je ressens ce soir. Alors je vous offre juste ceci : ma joie sincère, mes vœux du fond du cœur, et ce verre levé à votre bonheur. À [P1] et [P2].`,
    ],
    equilibre: [
      `Je terminerai par là où j'aurais dû commencer : en vous disant simplement que vous me rendez heureux ce soir. Par ce que vous représentez, par ce que vous construisez, par la façon dont vous regardez l'avenir ensemble. À votre santé — et que la fête commence vraiment !`,

      `Merci à [P1] et [P2] de nous avoir permis de partager ce moment. Et maintenant, assez parlé — levons nos verres. À votre amour, à votre avenir, et à tout ce qui rend la vie belle. Santé !`,

      `Ce n'est pas souvent qu'on a l'occasion de dire à quelqu'un qu'on l'aime, qu'on croit en lui, et qu'on est fier de le connaître. Ce soir, j'en profite. À [P1] et [P2] — avec tout ce que j'ai.`,
    ],
  },
}

const DUREE_SECTIONS: Record<Duree, string[]> = {
  court: ['opening', 'histoire', 'toast'],
  moyen: ['opening', 'histoire', 'qualites', 'couple', 'toast'],
  long:  ['opening', 'histoire', 'qualites', 'couple', 'souvenir', 'avenir', 'toast'],
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

export function assembleDiscours(
  ton: Ton,
  duree: Duree,
  prenom1: string,
  prenom2: string,
  auteur: string,
): string {
  const sectionIds = DUREE_SECTIONS[duree]
  const parts = sectionIds.map(id => pick(SECTIONS[id][ton]))
  return parts
    .join('\n\n')
    .replace(/\[P1\]/g, prenom1 || 'Prénom 1')
    .replace(/\[P2\]/g, prenom2 || 'Prénom 2')
    .replace(/\[AUTEUR\]/g, auteur || 'je')
}
