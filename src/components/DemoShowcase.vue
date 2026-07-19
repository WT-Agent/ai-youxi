<template>
  <section class="glass-card showcase-container">
    <div class="showcase-header">
      <div class="showcase-title-group">
        <h2 class="showcase-title">游戏策划与通关攻略案例库 (30 精选样例)</h2>
        <p class="showcase-subtitle">体验不同品类的硬核帧数连招、系统数值策划、保姆逃荒逃避与团队开荒指挥，点击“一键同款生成”即可即刻核算</p>
      </div>
      <div class="showcase-badge">游戏秘籍 · 免费体验</div>
    </div>

    <!-- 搜索与分类筛选 -->
    <div class="showcase-filter-bar">
      <div class="category-tabs">
        <button 
          v-for="cat in categories" 
          :key="cat"
          class="category-tab"
          :class="{ active: currentCategory === cat }"
          @click="currentCategory = cat"
        >
          {{ cat }}
        </button>
      </div>
      <div class="search-input-wrapper">
        <input 
          v-model="searchQuery"
          type="text"
          placeholder="搜索游戏名称、BOSS打法、数值策划、卡牌配装、流派或关键字..."
          class="search-input"
        />
      </div>
    </div>

    <!-- 样例列表格 Grid -->
    <div class="sample-grid">
      <div 
        v-for="sample in paginatedSamples" 
        :key="sample.id" 
        class="sample-card"
      >
        <div class="sample-card-header">
          <span class="topic-category-tag">{{ sample.category }}</span>
          <span class="style-name-tag">{{ sample.style }}</span>
        </div>
        <div class="sample-original">
          <span class="sample-label">游戏目标：</span>“{{ sample.destination }}，需求：{{ sample.topic }}”
        </div>
        <div class="sample-rewritten">
          <span class="sample-label">通关秘籍：</span>{{ sample.core }}
        </div>
        <div class="sample-card-footer">
          <button class="use-sample-btn" @click="$emit('use-sample', sample.topic, sample.destination)">
            一键同款生成
          </button>
        </div>
      </div>
    </div>

    <!-- 空状态提示 -->
    <div v-if="filteredSamples.length === 0" class="empty-showcase">
      未找到匹配的游戏策划与攻略案例，请尝试切换分类或重置搜索关键词。
    </div>

    <!-- 分页组件 -->
    <div v-if="filteredSamples.length > pageSize" class="pagination-bar">
      <button 
        class="page-btn" 
        :disabled="currentPage === 1"
        @click="currentPage--"
      >
        上一页
      </button>
      <span class="page-info">第 {{ currentPage }} / {{ totalPages }} 页 (共 {{ filteredSamples.length }} 条)</span>
      <button 
        class="page-btn" 
        :disabled="currentPage === totalPages"
        @click="currentPage++"
      >
        下一页
      </button>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';

defineEmits<{
  (e: 'use-sample', text: string, destination: string): void;
}>();

const categories = ['全部', '动作角色扮演', '策略卡牌', '开放世界', '独立肉鸽', '竞技电竞'];
const currentCategory = ref('全部');
const searchQuery = ref('');
const currentPage = ref(1);
const pageSize = 6;

interface YouxiSample {
  id: number;
  category: string;
  destination: string;
  topic: string;
  style: string;
  core: string;
}

// 精选 30 条游戏策划与攻略案例
const raw30Samples: YouxiSample[] = [
  {
    id: 1,
    category: '动作角色扮演',
    destination: '《黑神话：悟空》虎先锋BOSS战',
    topic: '关注招式硬直避让、立棍式与铜头铁臂切技时机。',
    style: '硬核高玩与极限通关流',
    core: '攻略：虎先锋二阶段三连斩出招前摇后摇帧数解析，避开侧跃横扫，利用聚形散气进行隐身蓄力背刺，满棍势一击必杀。'
  },
  {
    id: 2,
    category: '独立肉鸽',
    destination: '《地牢探索者》独立肉鸽游戏策划',
    topic: '求卡组遗物构筑、局外成长经济循环与数值平衡GDD。',
    style: '游戏策划与数值机制流',
    core: '策划：设计“弃牌流与毒素堆叠”双支柱机制，局外金币购买永久初始血量，控制通关率在18%-22%完美黄金区间。'
  },
  {
    id: 3,
    category: '开放世界',
    destination: '《原神》深境螺旋12层满星',
    topic: '求低配平民阵容、圣遗物词条搭配与怪物聚怪拉怪手法。',
    style: '休闲保姆与逃荒避坑流',
    core: '攻略：平民国家队（香菱/行秋/班尼特/重云）循环手顺，开局向左后方闪避诱导沙虫聚拢，产球元素爆发无缝覆盖。'
  },
  {
    id: 4,
    category: '动作角色扮演',
    destination: '《艾尔登法环》女武神玛莲妮亚',
    topic: '水鸟乱舞死磕，求无伤逃荒逃避走位与法师逃荒配装。',
    style: '休闲保姆与逃荒避坑流',
    core: '攻略：携带仿身泪滴大哥吸仇恨，法师远程释放彗星亚兹勒爆破；水鸟乱舞第一段后撤，二三段向前穿身闪避。'
  },
  {
    id: 5,
    category: '竞技电竞',
    destination: '《英雄联盟》中单游走与控线',
    topic: '求前5分钟兵线推慢线、河道蟹团战与支援时机。',
    style: '团队开荒与副本指挥流',
    core: '攻略：第3波炮车线完成慢推垫兵进塔，利用敌方补塔兵视野盲机游走下路，形成四打二越塔优势。'
  },
  {
    id: 6,
    category: '策略卡牌',
    destination: '《杀戮尖塔》观者进阶20心脏',
    topic: '求神化保命、保进愤怒与退姿态无限流牌库控制。',
    style: '硬核高玩与极限通关流',
    core: '攻略：维持牌库张数在10张以内，依托“猛击+警觉”实现神圣退入姿态能量循环，心脏多段伤害前预留护甲。'
  },
  {
    id: 7,
    category: '开放世界',
    destination: '《塞尔达传说：王国之泪》左纳乌装备构筑',
    topic: '求马克飞艇与自走炮轰炸机建造零件与电池优化。',
    style: '游戏策划与数值机制流',
    core: '攻略：使用2个风扇与1个操纵杆以45度角粘合，最小消耗达成永久空战飞行，搭配光头龙头与炮台自动追击。'
  },
  {
    id: 8,
    category: '独立肉鸽',
    destination: '《哈迪斯》热度16枪4闪电流',
    topic: '求宙斯祝福优先级、投掷流与锤子改造推荐。',
    style: '硬核高玩与极限通关流',
    core: '攻略：首选宙斯普攻静电连锁，锤子改造选择“散弹枪”，冲刺搭配波塞冬形成击退壁咚双重特效。'
  },
  {
    id: 9,
    category: '动作角色扮演',
    destination: '《只狼：影逝二度》剑圣苇名一心',
    topic: '关注一阶段剑法识破、二阶段枪法看破与三阶段雷反。',
    style: '硬核高玩与极限通关流',
    core: '攻略：一阶段保持贴身拼刀“打三防一”，二阶段长枪横扫前摇及时看破（危字），三阶段空中跳跃迎雷反弹。'
  },
  {
    id: 10,
    category: '竞技电竞',
    destination: '《王者荣耀》打野野区节奏与控龙',
    topic: '求双刷开局、2分钟暴君龙坑团战与反野路线。',
    style: '团队开荒与副本指挥流',
    core: '攻略：蓝开刷完全野3分50秒到达对抗路草丛，配合队友抓单，顺势拿下首条躯干暴君扩大经济差。'
  },
  {
    id: 11,
    category: '策略卡牌',
    destination: '《炉石传说》狂野模式战吼萨',
    topic: '求沙德沃克战吼锁卡、回手与无限控制解场。',
    style: '硬核高玩与极限通关流',
    core: '攻略：前期依托毒鱼套清场，中期使用撼地者与魅影幻象充能战吼，最终实现沙德沃克回手与全场封魔。'
  },
  {
    id: 12,
    category: '开放世界',
    destination: '《崩坏：星穹铁道》模拟宇宙9难5',
    topic: '求记忆命途永冻流、存护流反震与星魂搭配。',
    style: '休闲保姆与逃荒避坑流',
    core: '攻略：主选记忆命途获得“离神”破盾冻结，搭配三月七与佩拉双冻结，让BOSS无法出手即告消亡。'
  },
  {
    id: 13,
    category: '独立肉鸽',
    destination: '《死亡细胞》5细胞收藏家通关',
    topic: '求盾牌完美招架、诅咒宝箱取舍与近战双刀配装。',
    style: '硬核高玩与极限通关流',
    core: '攻略：携带前线盾进行近战秒招架，变异选择“捕食者与狂战士”，清怪保持隐身速通避开疫病惩罚。'
  },
  {
    id: 14,
    category: '动作角色扮演',
    destination: '《怪物猎人：荒野》大剑蓄力斩策划',
    topic: '求集中模式精准打弱点、防御反击与派生招式设计。',
    style: '游戏策划与数值机制流',
    core: '策划：设计“焦点打击”破坏部位弱点派生真蓄力斩，硬直时间与动作值成正比，兼顾高风险与高回报。'
  },
  {
    id: 15,
    category: '竞技电竞',
    destination: '《CS2》炼狱小镇B区防守与烟闪',
    topic: '求香蕉道争夺烟雾弹、一弹双闪与死角交叉火力。',
    style: '团队开荒与副本指挥流',
    core: '攻略：开局开局5秒香蕉道深处烧火，伴随高空反弹闪光弹挤压CT视野，设立B包点树下与死角交叉火力线。'
  },
  {
    id: 16,
    category: '剧情解密',
    destination: '《艾尔登法环》梅琳娜与癫火结局暗线',
    topic: '求癫火封印、金针解毒与故事世界观悲剧隐喻。',
    style: '剧情世界观与彩蛋拆解流',
    core: '解析：拆解三指神明与黄金树秩序的对立背景，梅琳娜作为引路人牺牲自我与选择毁灭王国的宿命冲突。'
  },
  {
    id: 17,
    category: '策略卡牌',
    destination: '《金铲铲之战》9五друг九五至尊阵容',
    topic: '求前期连胜过渡、8人口搜牌与5阶卡两星成型。',
    style: '休闲保姆与逃荒避坑流',
    core: '攻略：利用强力低阶羁绊（如剪纸仙灵）打连胜积攒50利息，4-2拉8人口搜出核心5费卡，转9五大成。'
  },
  {
    id: 18,
    category: '开放世界',
    destination: '《幻塔》最新大世界解密与世界BOSS',
    topic: '求源器组合跳跃、机制破盾与团队分配。',
    style: '团队开荒与副本指挥流',
    core: '攻略：破盾阶段全员切换物理/雷电重武器集中输出，主T拉住BOSS朝向外侧，辅T注意抬血与护盾。'
  },
  {
    id: 19,
    category: '独立肉鸽',
    destination: '《小骨：英雄杀手》绝死者物理飞刀',
    topic: '求头骨进化顺序、装备词条4勇气4击晕。',
    style: '硬核高玩与极限通关流',
    core: '攻略：将初始小骨进化为传说级“死神/绝死者”，堆叠4勇气物理伤害倍率，技能无缝CD实现全屏清场。'
  },
  {
    id: 20,
    category: '动作角色扮演',
    destination: '《鬼泣5》但丁SSS评价连招',
    topic: '求四风格实时切换、皇家卫士精准防突与魔人化。',
    style: '硬核高玩与极限通关流',
    core: '攻略：剑圣起手打出空连，切换枪神下落弹幕，瞬间切防守阻挡BOSS攻击充能，真魔人一发大招定乾坤。'
  },
  {
    id: 21,
    category: '竞技电竞',
    destination: '《无畏契约》捷风Jett拉线与进点',
    topic: '求烟雾突进、顺势瞬移与配合队友闪光抢点。',
    style: '团队开荒与副本指挥流',
    core: '攻略：进点前向包点封烟，配合队友盲闪瞬间使用“瞬向突进”进入烟雾区，打乱敌方预瞄线。'
  },
  {
    id: 22,
    category: '策略卡牌',
    destination: '《阴阳师》魂十五自动挂机阵容',
    topic: '求15秒极速通关、御魂面板要求与配速计算。',
    style: '休闲保姆与逃荒避坑流',
    core: '攻略：一速阿修罗（狂骨荒骷髅，攻击8000+爆伤250%），二速阿修罗补伤，三速座敷童子供火，15秒稳通。'
  },
  {
    id: 23,
    category: '开放世界',
    destination: '《鸣潮》今汐光系输出手法',
    topic: '求变奏技能积攒、声骸配装与声骸词条。',
    style: '硬核高玩与极限通关流',
    core: '攻略：利用渊武放柱子离场切今汐，快速叠满“韶光”层数，释放4阶强化技能吐息打出百万瞬间爆发。'
  },
  {
    id: 24,
    category: '剧情解密',
    destination: '《黑神话：悟空》四妹与紫云山隐藏暗线',
    topic: '求揭手印符咒、鹤仙人身份与四妹结局隐喻。',
    style: '剧情世界观与彩蛋拆解流',
    core: '解析：剖析盘丝洞四妹悲惨宿命，撕下天庭降伏符咒后被炼制为丹药的黑暗悲剧，揭示天庭统治的冰冷法则。'
  },
  {
    id: 25,
    category: '独立肉鸽',
    destination: '《土豆兄弟》狂战士近战无敌流',
    topic: '求武器全选扳手/拳套、属性堆叠收获与护甲。',
    style: '休闲保姆与逃荒避坑流',
    core: '攻略：前5波主堆“收获”获得经济积累，中期补充最大生命值与闪避，后期携带6把红色拳套横扫千军。'
  },
  {
    id: 26,
    category: '动作角色扮演',
    destination: '《暗黑破坏神4》死灵法师魂裂流',
    topic: '求暗金装备推荐、巅峰盘雕文选择与无限压制。',
    style: '硬核高玩与极限通关流',
    core: '攻略：佩戴“骨牢暗金”触发血雾无敌，巅峰盘优先点出“控制与剥削”雕文，压制伤害达到2000%以上。'
  },
  {
    id: 27,
    category: '竞技电竞',
    destination: '《DOTA2》卡尔14键技能切球',
    topic: '求吹风磁暴陨石推波连招与团战混乱切球。',
    style: '硬核高玩与极限通关流',
    core: '攻略：三雷切速吹风起手，预判落地时间切三火拉陨石与声波，连招一气呵成秒杀敌方双核心。'
  },
  {
    id: 28,
    category: '策略卡牌',
    destination: '《月圆之夜》骑士穿透流',
    topic: '求狂暴装备、二次打击与装备槽多重穿透。',
    style: '休闲保姆与逃荒避坑流',
    core: '攻略：拿满“短剑与狂暴双刃”，配合装备槽+2强化，第一回合打出数十张穿透攻击牌轻松秒杀狼人。'
  },
  {
    id: 29,
    category: '开放世界',
    destination: '《二之国》与独立游戏世界观策划',
    topic: '求童话绘本风格美术、大世界探索与宠物捉宠策划。',
    style: '游戏策划与数值机制流',
    core: '策划：建立以“吉卜力画风”为核心的暖色调世界观，宠物捕获成功率依托情感互动值，打造治愈系RPG。'
  },
  {
    id: 30,
    category: '竞技电竞',
    destination: '《三角洲行动》全面战场据点攻防',
    topic: '求侦察干员信标放置、工程干员防空与载具协同。',
    style: '团队开荒与副本指挥流',
    core: '攻略：侦察干员在据点后方隐蔽处放置复活信标，工程干员使用毒刺导弹封锁敌方直升机，步坦协同推进。'
  }
];

const samples = ref<YouxiSample[]>(raw30Samples);

const filteredSamples = computed(() => {
  return samples.value.filter(s => {
    const matchCat = currentCategory.value === '全部' || s.category === currentCategory.value;
    const matchQuery = !searchQuery.value.trim() || 
      s.topic.includes(searchQuery.value) || 
      s.destination.includes(searchQuery.value) ||
      s.style.includes(searchQuery.value) || 
      s.core.includes(searchQuery.value);
    return matchCat && matchQuery;
  });
});

const totalPages = computed(() => Math.ceil(filteredSamples.value.length / pageSize) || 1);

const paginatedSamples = computed(() => {
  const start = (currentPage.value - 1) * pageSize;
  return filteredSamples.value.slice(start, start + pageSize);
});

watch([currentCategory, searchQuery], () => {
  currentPage.value = 1;
});
</script>
