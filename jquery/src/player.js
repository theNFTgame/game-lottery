//  jillix/jQuery-sidebar
(function($){$.fn.sidebar=function(options){var self=this;if(self.length>1){return self.each(function(){$(this).sidebar(options)})}var width=self.outerWidth();var height=self.outerHeight();var settings=$.extend({speed:200,side:"left",isClosed:false,close:true},options);self.on("sidebar:open",function(ev,data){var properties={};properties[settings.side]=0;settings.isClosed=null;self.stop().animate(properties,$.extend({},settings,data).speed,function(){settings.isClosed=false;self.trigger("sidebar:opened")})});self.on("sidebar:close",function(ev,data){var properties={};if(settings.side==="left"||settings.side==="right"){properties[settings.side]=-self.outerWidth()}else{properties[settings.side]=-self.outerHeight()}settings.isClosed=null;self.stop().animate(properties,$.extend({},settings,data).speed,function(){settings.isClosed=true;self.trigger("sidebar:closed")})});self.on("sidebar:toggle",function(ev,data){if(settings.isClosed){self.trigger("sidebar:open",[data])}else{self.trigger("sidebar:close",[data])}});function closeWithNoAnimation(){self.trigger("sidebar:close",[{speed:0}])}if(!settings.isClosed&&settings.close){closeWithNoAnimation()}$(window).on("resize",function(){if(!settings.isClosed){return}closeWithNoAnimation()});self.data("sidebar",settings);return self};$.fn.sidebar.version="3.3.2"})(jQuery);


var stepped = 0, chunks = 0, rows = 0;
var start, end;
var parser;
var pauseChecked = false;
var printStepChecked = false;
var member = []; //按金额提升次数后名单
var originalMember = []; //初始数据导入名单
var gameWinnerList = []; //获奖者列表
var winnerNumber = 0; //总获奖数量
var levelLeftover = 0; //本级别目前还剩几个未抽取
var maxTogether = 25; //同时抽奖数量
var gameOption = [{
			numbers : 107,
			winnerId:[],
			name: 'level 6',
			offer: 1,
			leftover :0
		},{
			numbers : 100,
			winnerId:[],
			name: 'level 5',
			offer: 1,
			leftover :0
		},{
				numbers : 25,
				winnerId:[],
				name: 'level 4',
				offer: 1,
				leftover :0
			},{
			numbers : 10,
			winnerId:[],
			name: 'level 3',
			offer: 1,
			leftover :0
		},{
			numbers : 5,
			winnerId:[],
			name: 'level 2',
			offer: 1,
			leftover :0
		},{
			numbers : 1,
			winnerId:[],
			name: 'level 1',
			offer: 1,
			leftover :0
		}];
var g_Interval = 1;
var g_PersonCount = 1;//参加抽奖人数
var g_Timer;
var running = false;

//  事件绑定
$(function(){
	screenInit();
	showSetup();
	$('#submit-parse').click(function(){
		parseCsv();
	});
	$('#submit-lottery').click(function(){
		beginRndNum(this);
	});
	$('#btn-setting').click(function(){
		showSetup();
	});
	$('#btn-showall').click(function(){
		$('.lottery-screen').trigger();
	});
	$('.buttons .setting').click(function(){

	})
});
// 界面切换
function showSetup(){
	$('.layer-setup').show();
	$('.layer-game').hide();
}
function showGame(){
	$('.layer-setup').hide();
	$('.layer-game').show();
}
//开始预先抽奖，确定中奖的index
function startGame(){
	member = increaseChance(3800,originalMember);
	// console.log('startGame:',member)
	var drawer = draw(member.length - 1);
	// 提取奖项数量，设置奖项每次抽取展示数量
	for (i = 0; i < gameOption.length; i++) { 
		winnerNumber += gameOption[i].numbers;
		if(gameOption[i].numbers > 20){
			gameOption[i].offer = 25;
		}else{
			gameOption[i].offer = 1;
		}
		gameOption[i].leftover = gameOption[i].numbers;
	}
	// console.log('winnerNumber',winnerNumber);
	gameWinnerList = Array(winnerNumber).fill().map(()=>drawer.next().value);
	var gameInfo = '';
	for (i = 0; i < winnerNumber; i++) { 
		// console.log(member[gameWinnerList[i]]);
		if(member[gameWinnerList[i]]){
			gameInfo += 'winner ' + i + ': ' +gameWinnerList[i]+','+  member[gameWinnerList[i]] + "<br/>"
		}
	}
	$('.game-info').html('Number of participants:'+ member.length + ", " + gameOption[0].name + ' has ' + gameOption[0].leftover);
	// console.log('list:',gameInfo)
	// $('.game-state').html(gameInfo);
	// alert(gameInfo);
}
// 开始抽奖
function startLottery(){
	
	for (i = 0; i < gameOption.length; i++) { 
		if(gameOption[i].numbers > gameOption[i].winnerId.length){
			if(gameOption[i].offer >1){
				maxTogether = (gameOption[i].offer >= gameOption[i].leftover)? gameOption[i].leftover:gameOption[i].offer;
			}
			updateWinner(i);
			return false;
		}else{
			console.log('next lv');
		}
	}
	console.log('all Lottery',gameWinnerList,gameOption)
}
// 更新中奖者
function updateWinner(levelId){
	var display = '';
	var log = '';
	if(maxTogether >0){
		for (i = 0; i < maxTogether; i++) { 
			console.log('new', gameOption[levelId], member[gameWinnerList[0]]);
			gameOption[levelId].winnerId.push(gameWinnerList[0]);
			winnerNumber = winnerNumber - 1;
			gameOption[levelId].leftover = gameOption[levelId].leftover -1;
			levelLeftover = gameOption[levelId].leftover;
			display += '<p>' + member[gameWinnerList[0]]['From Account Name'] + '</p>';
			gameWinnerList.splice(0,1);
		}
		if( levelLeftover === 0 && gameOption[levelId + 1]){
			maxTogether = gameOption[levelId + 1].offer;
			log = "Next level is:" + " " + gameOption[levelId + 1].name + " has " + gameOption[levelId + 1].leftover+ " leftover, and will prize " +  maxTogether + " next time."
			$('.game-info').html(log);
		}else{
			log = " " + gameOption[levelId].name + " has " + gameOption[levelId].leftover+ " leftover, and will prize " +  maxTogether + " next time.";
			$('.game-info').html(log);
		}
		$('#ResultNum').html(display);
	}
	console.log('')
}
// 启动跑名字动画
function beginRndNum(trigger){
	if(gameWinnerList.length === 0 || winnerNumber === 0 ){
		console.log('no gameWinnerList');
		return false
	}
	if(running){
		running = false;
		clearTimeout(g_Timer);
		startLottery();		
		$(trigger).html("Start");
		$('#ResultNum').css('color','red');
	}
	else{
		running = true;
		$('#ResultNum').css('color','black');
		$(trigger).html("Stop");
		beginTimer();
	}
}
// 抽奖初始化
function screenInit(){
	$(".sidebar.left").sidebar().trigger("sidebar:open");

	$(".my-sidebar").on("sidebar:toggle", function () {
		// Do something on open
 	});

	$(document).bind("fullscreenchange", function(e) {
		console.log("Full screen changed.");
		$("#status").text($(document).fullScreen() ? 
				"Full screen enabled" : "Full screen disabled");
	});
	
	$(document).bind("fullscreenerror", function(e) {
		console.log("Full screen error.");
		$("#status").text("Browser won't enter full screen mode for some reason.");
	});

	//game setting
	for(i = 0; i < gameOption.length; i++){
		$("input.level-number:eq("+i+")").val(gameOption[i].numbers);
		$("input.level-name:eq("+i+")").val(gameOption[i].name);
	}
}
// 生成洗牌结果
function * draw(amount){
	const cards = Array(amount).fill().map((_,i)=>i+1); 

	for(let i = amount - 1; i >= 0; i--){
			let rand = Math.floor((i + 1) * Math.random());
			[cards[rand], cards[i]] =  [cards[i], cards[rand]];
			yield cards[i];
	}
}

// CSV插件配置
function buildConfig(){
	return {
		delimiter: $('#delimiter').val(),
		newline: getLineEnding(),
		header: true,
		dynamicTyping: $('#dynamicTyping').prop('checked'),
		preview: parseInt($('#preview').val() || 0),
		step: $('#stream').prop('checked') ? stepFn : undefined,
		encoding: $('#encoding').val(),
		worker: $('#worker').prop('checked'),
		comments: $('#comments').val(),
		complete: completeFn,
		error: errorFn,
		download: $('#download').prop('checked'),
		fastMode: $('#fastmode').prop('checked'),
		skipEmptyLines: true,
		chunk: $('#chunk').prop('checked') ? chunkFn : undefined,
		beforeFirstChunk: undefined,
	};

	function getLineEnding()
	{
		if ($('#newline-n').is(':checked'))
			return "\n";
		else if ($('#newline-r').is(':checked'))
			return "\r";
		else if ($('#newline-rn').is(':checked'))
			return "\r\n";
		else
			return "";
	}
}
// CSV导入数据辅助函数
function stepFn(results, parserHandle){
	stepped++;
	rows += results.data.length;

	parser = parserHandle;

	if (pauseChecked)
	{
		console.log(results, results.data[0]);
		parserHandle.pause();
		return;
	}

	if (printStepChecked)
		console.log(results, results.data[0]);
}
// CSV导入数据辅助函数
function chunkFn(results, streamer, file){
	if (!results)
		return;
	chunks++;
	rows += results.data.length;

	parser = streamer;

	if (printStepChecked)
		console.log("Chunk data:", results.data.length, results);

	if (pauseChecked)
	{
		console.log("Pausing; " + results.data.length + " rows in chunk; file:", file);
		streamer.pause();
		return;
	}
}
// CSV导入数据辅助函数
function errorFn(error, file){
	console.log("ERROR:", error, file);
}
// CSV导入数据辅助函数 完成函数
function completeFn(){
	end = performance.now();
	if (arguments[0]
			&& arguments[0].data)
		rows = arguments[0].data.length;
	
	originalMember = arguments[0].data;
	console.log("Finished input (async). Time:", end-start, arguments);
	console.log("Rows:", rows, "Stepped:", stepped, "Chunks:", chunks);
}
// CSV导入数据辅助函数 导入主函数
function parseCsv(){
	stepped = 0;
		chunks = 0;
		rows = 0;

		var txt = $('#input').val();
		var localChunkSize = $('#localChunkSize').val();
		var remoteChunkSize = $('#remoteChunkSize').val();
		var files = $('#files')[0].files;
		var config = buildConfig();

		// NOTE: Chunk size does not get reset if changed and then set back to empty/default value
		if (localChunkSize)
			Papa.LocalChunkSize = localChunkSize;
		if (remoteChunkSize)
			Papa.RemoteChunkSize = remoteChunkSize;

		pauseChecked = $('#step-pause').prop('checked');
		printStepChecked = $('#print-steps').prop('checked');


		if (files.length > 0)
		{
			if (!$('#stream').prop('checked') && !$('#chunk').prop('checked'))
			{
				for (var i = 0; i < files.length; i++)
				{
					if (files[i].size > 1024 * 1024 * 10)
					{
						alert("A file you've selected is larger than 10 MB; please choose to stream or chunk the input to prevent the browser from crashing.");
						return;
					}
				}
			}

			start = performance.now();

			$('#files').parse({
				config: config,
				before: function(file, inputElem)
				{
					console.log("Parsing file:", file);
				},
				complete: function()
				{	
					console.log("Done with all files.");
					startGame();
					showGame();
				}
			});
		}
		else
		{
			start = performance.now();
			var results = Papa.parse(txt, config);
			console.log("Synchronous parse results:", results);
		}
}
//按照订单金额，增加购买每超amount 3800中奖几率
function increaseChance(amount,list){
	var tempList = [];
	var times = 0;
	for(i = 0; i < list.length; i++){
		if(list[i]['Amount']>amount && list[i]['From Account Name']){
			times = parseInt(list[i]['Amount']/amount)
			for(j = 0; j < times; j++){
				tempList.push(list[i]);
			}
		}
	}
	if(tempList.length > 0){
		// console.log('tempList',tempList);
		return list.concat(...tempList);
	}else{
		return list
	}
	
}


// 更新滚动信息
function updateRndNum(max){
	var num = Math.floor(Math.random()*originalMember.length);
	var display = '<p>' + member[num]['From Account Name'] + '</p>';
	try {
		if(max>1){
			num = Math.floor(Math.random()*(originalMember.length - max));
			for (i = 0; i < max; i++) {
				display += '<p>' + originalMember[num+i]['From Account Name'] + '</p>';
			}
		}
	} catch (error) {
		console.log('updateRndNum error',error,num,member[num],display);
	}
	$('#ResultNum').html(display);
}
// 滚动计时器
function beginTimer(){
	g_Timer = setTimeout(beat, g_Interval);
}
// 滚动计时动画
function beat() {
	g_Timer = setTimeout(beat, g_Interval);
	updateRndNum(maxTogether);
}